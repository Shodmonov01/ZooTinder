import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { ModerateUserDto, ReviewDocumentDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  users(@Query('q') q?: string) {
    return this.admin.users(q);
  }

  @Patch('users/:id')
  moderateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ModerateUserDto,
  ) {
    return this.admin.moderateUser(user.id, id, dto);
  }

  @Get('pets')
  pets(@Query('q') q?: string) {
    return this.admin.pets(q);
  }

  @Get('verifications')
  verifications() {
    return this.admin.verificationQueue();
  }

  @Patch('verifications/:id')
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.admin.reviewDocument(user.id, id, dto);
  }

  @Get('reports')
  reports() {
    return this.admin.reports();
  }

  @Get('settings/ranking')
  ranking() {
    return this.admin.ranking();
  }

  @Patch('settings/ranking')
  updateRanking(
    @CurrentUser() user: AuthUser,
    @Body() body: Record<string, number>,
  ) {
    return this.admin.updateRanking(user.id, body);
  }
}
