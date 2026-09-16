import { Module } from '@nestjs/common';
import { BreedingController } from './breeding.controller';
import { BreedingService } from './breeding.service';

@Module({
  controllers: [BreedingController],
  providers: [BreedingService],
})
export class BreedingModule {}
