import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LikeAction, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { canonicalPetPair } from '../common/crypto';
import { serializePet } from '../common/pet.presenter';
import { CreateLikeDto } from './dto/like.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async swipe(userId: string, dto: CreateLikeDto) {
    const source = await this.prisma.pet.findFirst({
      where: { id: dto.sourcePetId, ownerId: userId, deletedAt: null },
    });
    if (!source) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Это не ваш питомец' });
    }
    if (dto.sourcePetId === dto.targetPetId) {
      throw new BadRequestException({
        code: 'INVALID_LIKE',
        message: 'Нельзя оценить собственного питомца',
      });
    }

    const like = await this.prisma.like.upsert({
      where: {
        actorUserId_sourcePetId_targetPetId: {
          actorUserId: userId,
          sourcePetId: dto.sourcePetId,
          targetPetId: dto.targetPetId,
        },
      },
      update: { action: dto.action },
      create: {
        actorUserId: userId,
        sourcePetId: dto.sourcePetId,
        targetPetId: dto.targetPetId,
        action: dto.action,
      },
    });

    if (dto.action !== LikeAction.LIKE) {
      return { like, match: null };
    }

    const reverse = await this.prisma.like.findFirst({
      where: {
        sourcePetId: dto.targetPetId,
        targetPetId: dto.sourcePetId,
        action: LikeAction.LIKE,
      },
    });
    if (!reverse) {
      return { like, match: null };
    }

    const [petAId, petBId] = canonicalPetPair(dto.sourcePetId, dto.targetPetId);
    const match = await this.prisma.match.upsert({
      where: { petAId_petBId: { petAId, petBId } },
      update: { status: MatchStatus.ACTIVE },
      create: {
        petAId,
        petBId,
        chat: { create: {} },
      },
      include: {
        chat: true,
        petA: { include: { photos: true, breed: true, species: true, owner: true } },
        petB: { include: { photos: true, breed: true, species: true, owner: true } },
      },
    });

    const otherOwnerId =
      match.petA.ownerId === userId ? match.petB.ownerId : match.petA.ownerId;
    await this.prisma.notification.createMany({
      data: [
        {
          userId,
          type: 'MATCH',
          title: 'Это взаимно!',
          body: 'Появился новый Match. Можно открыть чат.',
          payload: { matchId: match.id, chatId: match.chat?.id },
        },
        {
          userId: otherOwnerId,
          type: 'MATCH',
          title: 'Это взаимно!',
          body: 'Появился новый Match. Можно открыть чат.',
          payload: { matchId: match.id, chatId: match.chat?.id },
        },
      ],
    });

    return { like, match };
  }

  async listMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.ACTIVE,
        OR: [{ petA: { ownerId: userId } }, { petB: { ownerId: userId } }],
      },
      include: {
        chat: true,
        petA: {
          include: { photos: true, breed: true, species: true, owner: true, documents: true },
        },
        petB: {
          include: { photos: true, breed: true, species: true, owner: true, documents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return matches.map((match) => {
      const mine = match.petA.ownerId === userId ? match.petA : match.petB;
      const other = match.petA.ownerId === userId ? match.petB : match.petA;
      return {
        id: match.id,
        createdAt: match.createdAt,
        chatId: match.chat?.id,
        myPet: serializePet(mine),
        otherPet: serializePet(other),
      };
    });
  }

  async getMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        chat: true,
        petA: {
          include: { photos: true, breed: true, species: true, owner: true, documents: true },
        },
        petB: {
          include: { photos: true, breed: true, species: true, owner: true, documents: true },
        },
      },
    });
    if (!match) {
      throw new NotFoundException({ code: 'MATCH_NOT_FOUND', message: 'Match не найден' });
    }
    if (match.petA.ownerId !== userId && match.petB.ownerId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
    const mine = match.petA.ownerId === userId ? match.petA : match.petB;
    const other = match.petA.ownerId === userId ? match.petB : match.petA;
    return {
      id: match.id,
      createdAt: match.createdAt,
      chatId: match.chat?.id,
      myPet: serializePet(mine),
      otherPet: serializePet(other),
    };
  }
}
