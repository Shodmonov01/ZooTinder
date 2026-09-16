import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModerateUserDto, ReviewDocumentDto } from './dto/admin.dto';
import { DEFAULT_RANKING_WEIGHTS } from '../common/pet.presenter';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [users, pets, matches, reports, pendingDocs] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.pet.count({ where: { deletedAt: null } }),
      this.prisma.match.count({ where: { status: 'ACTIVE' } }),
      this.prisma.report.count({ where: { status: 'OPEN' } }),
      this.prisma.petDocument.count({ where: { status: VerificationStatus.PENDING } }),
    ]);
    return { users, pets, matches, openReports: reports, pendingVerifications: pendingDocs };
  }

  users(query?: string) {
    return this.prisma.user.findMany({
      where: query
        ? {
            OR: [
              { phone: { contains: query } },
              { displayName: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  pets(query?: string) {
    return this.prisma.pet.findMany({
      where: query
        ? { name: { contains: query } }
        : { deletedAt: null },
      include: { owner: true, breed: true, photos: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  verificationQueue() {
    return this.prisma.petDocument.findMany({
      where: {
        status: {
          in: [VerificationStatus.PENDING, VerificationStatus.RESUBMISSION_REQUESTED],
        },
      },
      include: { pet: { include: { owner: true } }, review: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewDocument(actorId: string, documentId: string, dto: ReviewDocumentDto) {
    const document = await this.prisma.petDocument.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Документ не найден',
      });
    }
    const updated = await this.prisma.petDocument.update({
      where: { id: documentId },
      data: {
        status: dto.status,
        review: {
          upsert: {
            create: {
              reviewerId: actorId,
              status: dto.status,
              reason: dto.reason,
              reviewedAt: new Date(),
            },
            update: {
              reviewerId: actorId,
              status: dto.status,
              reason: dto.reason,
              reviewedAt: new Date(),
            },
          },
        },
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'DOCUMENT_REVIEW',
        targetType: 'PetDocument',
        targetId: documentId,
        metadata: { status: dto.status, reason: dto.reason },
      },
    });
    return updated;
  }

  reports() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reporter: true },
      take: 100,
    });
  }

  async moderateUser(actorId: string, userId: string, dto: ModerateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
    });
    if (dto.status === UserStatus.BANNED || dto.status === UserStatus.SUSPENDED) {
      await this.prisma.pet.updateMany({
        where: { ownerId: userId },
        data: { isPublished: false },
      });
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'USER_MODERATION',
        targetType: 'User',
        targetId: userId,
        metadata: { status: dto.status, reason: dto.reason },
      },
    });
    return user;
  }

  async ranking() {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: 'ranking_weights' },
    });
    return setting?.value ?? DEFAULT_RANKING_WEIGHTS;
  }

  async updateRanking(actorId: string, value: Record<string, number>) {
    const setting = await this.prisma.appSetting.upsert({
      where: { key: 'ranking_weights' },
      update: { value },
      create: { key: 'ranking_weights', value },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'RANKING_UPDATE',
        targetType: 'AppSetting',
        targetId: 'ranking_weights',
        metadata: value,
      },
    });
    return setting.value;
  }
}
