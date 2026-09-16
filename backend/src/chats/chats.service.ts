import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/message.dto';
import { serializePet } from '../common/pet.presenter';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        match: {
          OR: [{ petA: { ownerId: userId } }, { petB: { ownerId: userId } }],
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        match: {
          include: {
            petA: { include: { photos: true, breed: true, species: true, owner: true } },
            petB: { include: { photos: true, breed: true, species: true, owner: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return chats.map((chat) => {
      const other =
        chat.match.petA.ownerId === userId ? chat.match.petB : chat.match.petA;
      return {
        id: chat.id,
        matchId: chat.matchId,
        otherPet: serializePet(other),
        lastMessage: chat.messages[0] ?? null,
      };
    });
  }

  async messages(userId: string, chatId: string) {
    const chat = await this.getAccessibleChat(userId, chatId);
    const items = await this.prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });
    return items;
  }

  async send(userId: string, chatId: string, dto: SendMessageDto) {
    const chat = await this.getAccessibleChat(userId, chatId);
    const otherOwnerId =
      chat.match.petA.ownerId === userId
        ? chat.match.petB.ownerId
        : chat.match.petA.ownerId;
    const blocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherOwnerId },
          { blockerId: otherOwnerId, blockedId: userId },
        ],
      },
    });
    if (blocked) {
      throw new ForbiddenException({
        code: 'BLOCKED',
        message: 'Переписка недоступна',
      });
    }
    if (!dto.text && !dto.attachmentUrl) {
      throw new ForbiddenException({
        code: 'EMPTY_MESSAGE',
        message: 'Сообщение не может быть пустым',
      });
    }

    const recentCount = await this.prisma.message.count({
      where: {
        chatId,
        senderId: userId,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recentCount >= 30) {
      throw new ForbiddenException({
        code: 'RATE_LIMIT',
        message: 'Слишком много сообщений',
      });
    }

    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        text: dto.text,
        attachmentUrl: dto.attachmentUrl,
        type: dto.attachmentUrl ? MessageType.PHOTO : MessageType.TEXT,
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: otherOwnerId,
        type: 'MESSAGE',
        title: 'Новое сообщение',
        body: dto.text?.slice(0, 80) || 'Вложение',
        payload: { chatId, messageId: message.id },
      },
    });
    return message;
  }

  private async getAccessibleChat(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        match: {
          include: { petA: true, petB: true },
        },
      },
    });
    if (!chat) {
      throw new NotFoundException({ code: 'CHAT_NOT_FOUND', message: 'Чат не найден' });
    }
    if (
      chat.match.petA.ownerId !== userId &&
      chat.match.petB.ownerId !== userId
    ) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Нет доступа' });
    }
    return chat;
  }
}
