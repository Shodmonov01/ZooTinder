import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BreedingService } from './breeding.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateBreedingRequestDto, UpdateBreedingRequestDto } from './dto/breeding.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BreedingController {
  constructor(private readonly breeding: BreedingService) {}

  @Post('breeding-requests')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBreedingRequestDto) {
    return this.breeding.create(user.id, dto);
  }

  @Get('breeding-requests')
  list(@CurrentUser() user: AuthUser) {
    return this.breeding.requests(user.id);
  }

  @Patch('breeding-requests/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBreedingRequestDto,
  ) {
    return this.breeding.update(user.id, id, dto);
  }

  @Get('breeding-events')
  events(@CurrentUser() user: AuthUser) {
    return this.breeding.events(user.id);
  }
}
