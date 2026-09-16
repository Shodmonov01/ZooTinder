import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BreedingRequestStatus } from '@prisma/client';

export class CreateBreedingRequestDto {
  @IsString()
  matchId: string;

  @IsString()
  senderPetId: string;

  @IsOptional()
  @IsDateString()
  proposedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class UpdateBreedingRequestDto {
  @IsEnum(BreedingRequestStatus)
  status: BreedingRequestStatus;

  @IsOptional()
  @IsDateString()
  proposedAt?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
