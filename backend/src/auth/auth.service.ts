import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateOtp,
  hashSecret,
  randomToken,
  sha256,
  verifySecret,
} from '../common/crypto';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const recent = await this.prisma.otpChallenge.findFirst({
      where: {
        phone: dto.phone,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && !this.isDev()) {
      throw new BadRequestException({
        code: 'OTP_RATE_LIMIT',
        message: 'Подождите минуту перед повторной отправкой кода',
      });
    }

    await this.prisma.otpChallenge.updateMany({
      where: { phone: dto.phone, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = this.isDev()
      ? this.config.get('OTP_DEV_CODE', '111111')
      : generateOtp();
    const ttl = Number(this.config.get('OTP_TTL_SECONDS', 300));
    await this.prisma.otpChallenge.create({
      data: {
        phone: dto.phone,
        codeHash: await hashSecret(code),
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    if (this.isDev()) {
      return {
        sent: true,
        debugCode: code,
        message: 'OTP отправлен. В dev-режиме код всегда 111111.',
      };
    }
    return { sent: true, message: 'OTP отправлен' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone: dto.phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'Код недействителен или истёк',
      });
    }
    if (challenge.attempts >= 5) {
      throw new UnauthorizedException({
        code: 'OTP_LOCKED',
        message: 'Слишком много попыток. Запросите новый код',
      });
    }

    const valid = await verifySecret(dto.code, challenge.codeHash);
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: { increment: 1 },
        consumedAt: valid ? new Date() : undefined,
      },
    });
    if (!valid) {
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'Неверный код',
      });
    }

    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          phone: dto.phone,
          status: UserStatus.ACTIVE,
          verificationStatus: VerificationStatus.VERIFIED,
          displayName: 'Владелец',
          city: 'Toshkent',
        },
      }));

    if (user.status !== UserStatus.ACTIVE || user.deletedAt) {
      throw new UnauthorizedException({
        code: 'ACCOUNT_BLOCKED',
        message: 'Аккаунт заблокирован',
      });
    }

    const tokens = await this.issueTokens(user.id, user.role, user.phone);
    return {
      ...tokens,
      isNew: !existing,
      user: this.serializeUser(user),
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'REFRESH_INVALID',
        message: 'Сессия истекла',
      });
    }
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await this.issueTokens(
      stored.user.id,
      stored.user.role,
      stored.user.phone,
    );
    return { ...tokens, user: this.serializeUser(stored.user) };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: sha256(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { ok: true };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  serializeUser(user: {
    id: string;
    phone: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    city: string | null;
    status: UserStatus;
    role: string;
    verificationStatus: VerificationStatus;
    locale: string;
    privacySettings: unknown;
    notificationSettings: unknown;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      city: user.city,
      status: user.status,
      role: user.role,
      verificationStatus: user.verificationStatus,
      locale: user.locale,
      privacySettings: user.privacySettings,
      notificationSettings: user.notificationSettings,
      createdAt: user.createdAt,
    };
  }

  private async issueTokens(userId: string, role: string, phone: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role, phone },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );
    const refreshToken = randomToken();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  private isDev() {
    return this.config.get('NODE_ENV', 'development') !== 'production';
  }
}
