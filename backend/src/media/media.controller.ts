import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { basename, join } from 'path';
import { existsSync } from 'fs';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('media')
export class MediaController {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @SkipThrottle()
  @Get(':filename')
  async file(
    @Param('filename') filename: string,
    @Query('access') access: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const header = req.headers.authorization;
    const token = access || (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Нужна авторизация' });
    }
    try {
      await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Сессия истекла' });
    }

    const safe = basename(filename);
    if (!safe || safe !== filename || safe.includes('..')) {
      throw new NotFoundException({ code: 'FILE_NOT_FOUND', message: 'Файл не найден' });
    }
    const full = join(process.cwd(), 'uploads', safe);
    if (!existsSync(full)) {
      throw new NotFoundException({ code: 'FILE_NOT_FOUND', message: 'Файл не найден' });
    }
    return res.sendFile(full);
  }
}
