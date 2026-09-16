import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateLikeDto } from './dto/like.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post('likes')
  swipe(@CurrentUser() user: AuthUser, @Body() dto: CreateLikeDto) {
    return this.matching.swipe(user.id, dto);
  }

  @Get('matches')
  list(@CurrentUser() user: AuthUser) {
    return this.matching.listMatches(user.id);
  }

  @Get('matches/:id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.matching.getMatch(user.id, id);
  }
}
