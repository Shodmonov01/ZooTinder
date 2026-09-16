import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { BreedingStatus, Sex } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsString()
  speciesId: string;

  @IsOptional()
  @IsString()
  breedId?: string;

  @IsEnum(Sex)
  sex: Sex;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperament?: string[];

  @IsOptional()
  @IsEnum(BreedingStatus)
  breedingStatus?: BreedingStatus;

  @IsString()
  city: string;

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  breedId?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperament?: string[];

  @IsOptional()
  @IsEnum(BreedingStatus)
  breedingStatus?: BreedingStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateSearchPreferenceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  breedIds?: string[];

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ageMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightMinKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightMaxKg?: number;

  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  healthVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  pedigreeVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  dnaTested?: boolean;
}
