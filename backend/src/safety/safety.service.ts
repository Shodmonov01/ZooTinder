import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto, CreateReportDto } from './dto/safety.dto';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  report(userId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        reporterId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details,
      },
    });
  }

  async block(userId: string, dto: CreateBlockDto) {
    return this.prisma.block.upsert({
      where: {
        blockerId_blockedId: { blockerId: userId, blockedId: dto.blockedId },
      },
      update: {},
      create: { blockerId: userId, blockedId: dto.blockedId },
    });
  }
}
