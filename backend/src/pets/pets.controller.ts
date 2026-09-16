import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreatePetDto, UpdatePetDto, UpdateSearchPreferenceDto } from './dto/pet.dto';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly pets: PetsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.pets.listMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePetDto) {
    return this.pets.create(user.id, dto);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.pets.getById(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePetDto,
  ) {
    return this.pets.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.pets.remove(user.id, id);
  }

  @Post(':id/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  addPhoto(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      return { code: 'FILE_REQUIRED', message: 'Файл обязателен' };
    }
    return this.pets.addPhoto(user.id, id, file.filename);
  }

  @Patch(':id/preferences')
  updatePreferences(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateSearchPreferenceDto,
  ) {
    return this.pets.updatePreferences(user.id, id, dto);
  }
}
