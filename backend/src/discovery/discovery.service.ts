import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BreedingStatus,
  DocumentType,
  Sex,
  VerificationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ageYears, haversineKm } from '../common/geo';
import { asStringArray, DEFAULT_RANKING_WEIGHTS, petBadges, serializePet } from '../common/pet.presenter';

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(userId: string, petId?: string, limit = 20) {
    const source = await this.resolveSourcePet(userId, petId);
    const prefs = source.searchPreference;
    const blockedIds = await this.blockedUserIds(userId);
    const alreadyActed = await this.prisma.like.findMany({
      where: { actorUserId: userId, sourcePetId: source.id },
      select: { targetPetId: true },
    });
    const excludeIds = new Set([
      source.id,
      ...alreadyActed.map((row) => row.targetPetId),
    ]);

    const candidates = await this.prisma.pet.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        breedingStatus: { not: BreedingStatus.NOT_AVAILABLE },
        ownerId: { not: userId, notIn: blockedIds },
        speciesId: source.speciesId,
        sex: prefs?.sex ?? (source.sex === Sex.MALE ? Sex.FEMALE : Sex.MALE),
      },
      include: {
        photos: true,
        documents: true,
        breed: true,
        species: true,
        owner: {
          select: {
            id: true,
            displayName: true,
            city: true,
            verificationStatus: true,
          },
        },
      },
      take: 200,
    });

    const weights = await this.rankingWeights();
    const scored = candidates
      .filter((pet) => !excludeIds.has(pet.id))
      .map((pet) => {
        const distanceKm = haversineKm(
          source.latitude,
          source.longitude,
          pet.latitude,
          pet.longitude,
        );
        const age = ageYears(pet.birthDate);
        const badges = petBadges(pet);
        return { pet, distanceKm, age, badges };
      })
      .filter((row) => {
        if (prefs?.radiusKm && row.distanceKm > prefs.radiusKm) return false;
        if (prefs?.ageMin != null && row.age < prefs.ageMin) return false;
        if (prefs?.ageMax != null && row.age > prefs.ageMax) return false;
        if (prefs?.city && row.pet.city !== prefs.city) return false;
        const breedIds = asStringArray(prefs?.breedIds);
        if (breedIds.length && row.pet.breedId && !breedIds.includes(row.pet.breedId)) {
          return false;
        }
        if (prefs?.verifiedOnly && !row.badges.ownerVerified) return false;
        if (prefs?.healthVerified && !row.badges.healthVerified) return false;
        if (prefs?.pedigreeVerified && !row.badges.pedigreeVerified) return false;
        if (prefs?.dnaTested && !row.badges.dnaTested) return false;
        if (prefs?.weightMinKg && Number(row.pet.weightKg ?? 0) < Number(prefs.weightMinKg)) {
          return false;
        }
        if (prefs?.weightMaxKg && Number(row.pet.weightKg ?? 99) > Number(prefs.weightMaxKg)) {
          return false;
        }
        return true;
      })
      .map((row) => {
        const score = this.score(source, row, weights);
        return {
          ...serializePet(row.pet, { distanceKm: row.distanceKm, score }),
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit);

    return {
      sourcePetId: source.id,
      items: scored,
      disclaimer:
        'Оценка используется только для ранжирования карточек и не является ветеринарным или генетическим заключением.',
    };
  }

  private score(
    source: {
      breedId: string | null;
      latitude: number;
      longitude: number;
      birthDate: Date;
      weightKg: number | null;
    },
    row: {
      pet: {
        breedId: string | null;
        weightKg: number | null;
        documents?: { type: DocumentType; status: VerificationStatus; expiresAt: Date | null }[];
      };
      distanceKm: number;
      age: number;
      badges: ReturnType<typeof petBadges>;
    },
    weights: typeof DEFAULT_RANKING_WEIGHTS,
  ) {
    const breedScore =
      source.breedId && row.pet.breedId && source.breedId === row.pet.breedId
        ? 1
        : 0.35;
    const distanceScore = Math.max(0, 1 - row.distanceKm / 80);
    const ageDiff = Math.abs(ageYears(source.birthDate) - row.age);
    const ageScore = Math.max(0, 1 - ageDiff / 10);
    const sourceWeight = Number(source.weightKg ?? 0);
    const targetWeight = Number(row.pet.weightKg ?? 0);
    const sizeScore =
      sourceWeight && targetWeight
        ? Math.max(0, 1 - Math.abs(sourceWeight - targetWeight) / Math.max(sourceWeight, 1))
        : 0.5;

    return Number(
      (
        weights.breed * breedScore +
        weights.distance * distanceScore +
        weights.age * ageScore +
        weights.size * sizeScore +
        weights.pedigree * (row.badges.pedigreeVerified ? 1 : 0) +
        weights.health * (row.badges.healthVerified ? 1 : 0) +
        weights.dna * (row.badges.dnaTested ? 1 : 0)
      ).toFixed(4),
    );
  }

  private async rankingWeights() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'ranking_weights' },
    });
    return {
      ...DEFAULT_RANKING_WEIGHTS,
      ...((setting?.value as Partial<typeof DEFAULT_RANKING_WEIGHTS>) ?? {}),
    };
  }

  private async resolveSourcePet(userId: string, petId?: string) {
    const pet = await this.prisma.pet.findFirst({
      where: {
        ownerId: userId,
        deletedAt: null,
        ...(petId ? { id: petId } : {}),
      },
      include: { searchPreference: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!pet) {
      throw new NotFoundException({
        code: 'PET_REQUIRED',
        message: 'Сначала создайте профиль питомца',
      });
    }
    return pet;
  }

  private async blockedUserIds(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    });
    return blocks.map((block) =>
      block.blockerId === userId ? block.blockedId : block.blockerId,
    );
  }
}
