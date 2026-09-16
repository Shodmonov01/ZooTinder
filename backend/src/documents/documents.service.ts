import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async list(userId: string, petId: string) {
    await this.ensureOwner(userId, petId);
    return this.prisma.petDocument.findMany({
      where: { petId },
      include: { review: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: string,
    petId: string,
    dto: CreateDocumentDto,
    filename: string,
  ) {
    await this.ensureOwner(userId, petId);
    const fileUrl = `${this.config.get('PUBLIC_APP_URL', 'http://localhost:4000')}/uploads/${filename}`;
    return this.prisma.petDocument.create({
      data: {
        petId,
        type: dto.type,
        fileUrl,
        issuer: dto.issuer,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        description: dto.description,
        status: VerificationStatus.PENDING,
        review: {
          create: { status: VerificationStatus.PENDING },
        },
      },
      include: { review: true },
    });
  }

  private async ensureOwner(userId: string, petId: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, deletedAt: null },
    });
    if (!pet) {
      throw new NotFoundException({ code: 'PET_NOT_FOUND', message: 'Питомец не найден' });
    }
    if (pet.ownerId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
  }
}
