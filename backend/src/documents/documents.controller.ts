import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateDocumentDto } from './dto/document.dto';

@Controller('pets/:id/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(@Param('id') petId: string, @CurrentUser() user: AuthUser) {
    return this.documents.list(user.id, petId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname) || '.pdf'}`);
        },
      }),
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  create(
    @Param('id') petId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      return { code: 'FILE_REQUIRED', message: 'Файл обязателен' };
    }
    return this.documents.create(user.id, petId, dto, file.filename);
  }
}
