import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BreedingEventType, BreedingRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBreedingRequestDto,
  UpdateBreedingRequestDto,
} from './dto/breeding.dto';

@Injectable()
export class BreedingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBreedingRequestDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      include: { petA: true, petB: true },
    });
    if (!match) {
      throw new NotFoundException({ code: 'MATCH_NOT_FOUND', message: 'Match не найден' });
    }
    const senderPet =
      match.petA.id === dto.senderPetId ? match.petA : match.petB;
    const receiverPet =
      match.petA.id === dto.senderPetId ? match.petB : match.petA;
    if (senderPet.ownerId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
    return this.prisma.breedingRequest.create({
      data: {
        matchId: match.id,
        senderPetId: senderPet.id,
        receiverPetId: receiverPet.id,
        proposedAt: dto.proposedAt ? new Date(dto.proposedAt) : undefined,
        note: dto.note,
        status: BreedingRequestStatus.SENT,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateBreedingRequestDto) {
    const request = await this.prisma.breedingRequest.findUnique({
      where: { id },
      include: { senderPet: true, receiverPet: true },
    });
    if (!request) {
      throw new NotFoundException({
        code: 'REQUEST_NOT_FOUND',
        message: 'Запрос не найден',
      });
    }
    const isParty =
      request.senderPet.ownerId === userId ||
      request.receiverPet.ownerId === userId;
    if (!isParty) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
    const updated = await this.prisma.breedingRequest.update({
      where: { id },
      data: {
        status: dto.status,
        proposedAt: dto.proposedAt ? new Date(dto.proposedAt) : undefined,
        note: dto.note,
      },
    });
    if (
      dto.status === BreedingRequestStatus.SCHEDULED ||
      dto.status === BreedingRequestStatus.COMPLETED
    ) {
      await this.prisma.breedingEvent.create({
        data: {
          petId: request.senderPetId,
          partnerPetId: request.receiverPetId,
          eventType: BreedingEventType.MATING,
          scheduledAt: updated.proposedAt,
          completedAt:
            dto.status === BreedingRequestStatus.COMPLETED ? new Date() : undefined,
          notes: updated.note,
        },
      });
    }
    return updated;
  }

  async events(userId: string) {
    return this.prisma.breedingEvent.findMany({
      where: { pet: { ownerId: userId } },
      include: { partnerPet: { include: { photos: true, breed: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async requests(userId: string) {
    return this.prisma.breedingRequest.findMany({
      where: {
        OR: [
          { senderPet: { ownerId: userId } },
          { receiverPet: { ownerId: userId } },
        ],
      },
      include: { senderPet: true, receiverPet: true, match: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
