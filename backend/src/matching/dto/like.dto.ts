import { IsEnum, IsString } from 'class-validator';
import { LikeAction } from '@prisma/client';

export class CreateLikeDto {
  @IsString()
  sourcePetId: string;

  @IsString()
  targetPetId: string;

  @IsEnum(LikeAction)
  action: LikeAction;
}
