import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationStatus, DocumentType, HealthRecordType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/document.dto';
import { mediaPath, rewriteMediaUrl } from '../common/media';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, petId: string) {
    await this.ensureOwner(userId, petId);
    const items = await this.prisma.petDocument.findMany({
      where: { petId },
      include: { review: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => ({ ...item, fileUrl: rewriteMediaUrl(item.fileUrl) }));
  }

  async create(
    userId: string,
    petId: string,
    dto: CreateDocumentDto,
    filename: string,
  ) {
    await this.ensureOwner(userId, petId);
    const fileUrl = mediaPath(filename);
    const document = await this.prisma.petDocument.create({
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

    const issued = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
    if (
      dto.type === DocumentType.VACCINATION ||
      dto.type === DocumentType.DEWORMING ||
      dto.type === DocumentType.HEALTH_CERTIFICATE
    ) {
      await this.prisma.healthRecord.create({
        data: {
          petId,
          type:
            dto.type === DocumentType.DEWORMING
              ? HealthRecordType.DEWORMING
              : dto.type === DocumentType.HEALTH_CERTIFICATE
                ? HealthRecordType.VET_CHECK
                : HealthRecordType.VACCINATION,
          date: issued,
          notes: dto.description,
        },
      });
    }
    if (dto.type === DocumentType.DNA_TEST) {
      await this.prisma.dNARecord.create({
        data: {
          petId,
          lab: dto.issuer || 'Lab',
          testName: dto.description || 'DNA',
          documentId: document.id,
        },
      });
    }
    if (dto.type === DocumentType.PEDIGREE) {
      await this.prisma.pedigree.upsert({
        where: { petId },
        update: { registry: dto.issuer, documentId: document.id },
        create: { petId, registry: dto.issuer, documentId: document.id },
      });
    }

    return { ...document, fileUrl: rewriteMediaUrl(document.fileUrl) };
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
