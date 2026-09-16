import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: {
          where: { deletedAt: null },
          include: { photos: true, breed: true, species: true, documents: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return {
      ...this.auth.serializeUser(user),
      petsCount: user.pets.length,
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        email: dto.email,
        city: dto.city,
        avatarUrl: dto.avatarUrl,
        locale: dto.locale,
        privacySettings: dto.privacySettings as Prisma.InputJsonValue | undefined,
        notificationSettings: dto.notificationSettings as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
    return this.auth.serializeUser(user);
  }

  async deleteMe(userId: string) {
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.DELETED,
          deletedAt: new Date(),
          phone: `deleted_${userId}`,
          email: null,
        },
      }),
      this.prisma.pet.updateMany({
        where: { ownerId: userId },
        data: { deletedAt: new Date(), isPublished: false },
      }),
    ]);
    return { ok: true };
  }
}
