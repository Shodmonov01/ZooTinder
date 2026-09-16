import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BreedingStatus, Prisma, Sex } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  canPublish,
  serializePet,
} from '../common/pet.presenter';
import {
  CreatePetDto,
  UpdatePetDto,
  UpdateSearchPreferenceDto,
} from './dto/pet.dto';

const petInclude = {
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
  searchPreference: true,
} satisfies Prisma.PetInclude;

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listMine(userId: string) {
    const pets = await this.prisma.pet.findMany({
      where: { ownerId: userId, deletedAt: null },
      include: petInclude,
      orderBy: { createdAt: 'desc' },
    });
    return pets.map((pet) => serializePet(pet));
  }

  async getById(id: string, userId?: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id, deletedAt: null },
      include: petInclude,
    });
    if (!pet) {
      throw new NotFoundException({ code: 'PET_NOT_FOUND', message: 'Питомец не найден' });
    }
    const isOwner = pet.ownerId === userId;
    if (!pet.isPublished && !isOwner) {
      throw new NotFoundException({ code: 'PET_NOT_FOUND', message: 'Питомец не найден' });
    }
    const serialized = serializePet(pet);
    if (!isOwner) {
      return serialized;
    }
    return { ...serialized, searchPreference: pet.searchPreference };
  }

  async create(userId: string, dto: CreatePetDto) {
    const pet = await this.prisma.pet.create({
      data: {
        ownerId: userId,
        name: dto.name,
        speciesId: dto.speciesId,
        breedId: dto.breedId,
        sex: dto.sex,
        birthDate: new Date(dto.birthDate),
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        color: dto.color,
        bio: dto.bio,
        temperament: dto.temperament ?? [],
        breedingStatus: dto.breedingStatus ?? BreedingStatus.LOOKING,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        searchPreference: {
          create: {
            sex: dto.sex === Sex.MALE ? Sex.FEMALE : Sex.MALE,
            city: dto.city,
          },
        },
      },
      include: petInclude,
    });
    return serializePet(pet);
  }

  async update(userId: string, petId: string, dto: UpdatePetDto) {
    const pet = await this.ensureOwner(userId, petId);
    if (dto.isPublished && !canPublish(pet)) {
      throw new BadRequestException({
        code: 'PET_INCOMPLETE',
        message:
          'Нельзя опубликовать профиль без вида, пола, даты рождения, локации и хотя бы 1 фото',
      });
    }
    const updated = await this.prisma.pet.update({
      where: { id: petId },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      include: petInclude,
    });
    return serializePet(updated);
  }

  async remove(userId: string, petId: string) {
    await this.ensureOwner(userId, petId);
    await this.prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: new Date(), isPublished: false },
    });
    return { ok: true };
  }

  async addPhoto(userId: string, petId: string, filename: string) {
    const pet = await this.ensureOwner(userId, petId);
    const publicUrl = `${this.config.get('PUBLIC_APP_URL', 'http://localhost:4000')}/uploads/${filename}`;
    const photo = await this.prisma.petPhoto.create({
      data: {
        petId,
        url: publicUrl,
        sortOrder: pet.photos.length,
      },
    });
    return photo;
  }

  async updatePreferences(
    userId: string,
    petId: string,
    dto: UpdateSearchPreferenceDto,
  ) {
    await this.ensureOwner(userId, petId);
    const pref = await this.prisma.searchPreference.upsert({
      where: { petId },
      update: dto,
      create: { petId, ...dto },
    });
    return pref;
  }

  private async ensureOwner(userId: string, petId: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
      include: petInclude,
    });
    if (!pet) {
      throw new NotFoundException({ code: 'PET_NOT_FOUND', message: 'Питомец не найден' });
    }
    if (pet.ownerId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
    return pet;
  }
}
