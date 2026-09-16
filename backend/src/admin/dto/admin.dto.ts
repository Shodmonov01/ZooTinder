import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus, VerificationStatus } from '@prisma/client';

export class ReviewDocumentDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ModerateUserDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
