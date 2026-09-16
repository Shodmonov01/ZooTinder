import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { PetsModule } from './pets/pets.module';
import { DocumentsModule } from './documents/documents.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchingModule } from './matching/matching.module';
import { ChatsModule } from './chats/chats.module';
import { BreedingModule } from './breeding/breeding.module';
import { SafetyModule } from './safety/safety.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogsModule,
    PetsModule,
    DocumentsModule,
    DiscoveryModule,
    MatchingModule,
    ChatsModule,
    BreedingModule,
    SafetyModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
