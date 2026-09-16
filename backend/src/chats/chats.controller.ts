import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/message.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.chats.list(user.id);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chats.messages(user.id, id);
  }

  @Post(':id/messages')
  send(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.chats.send(user.id, id, dto);
  }
}
