import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get()
  feed(
    @CurrentUser() user: AuthUser,
    @Query('petId') petId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.discovery.feed(user.id, petId, limit ? Number(limit) : 20);
  }
}
