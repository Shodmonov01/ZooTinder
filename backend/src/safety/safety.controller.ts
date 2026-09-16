import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateBlockDto, CreateReportDto } from './dto/safety.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post('reports')
  report(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.safety.report(user.id, dto);
  }

  @Post('blocks')
  block(@CurrentUser() user: AuthUser, @Body() dto: CreateBlockDto) {
    return this.safety.block(user.id, dto);
  }
}
