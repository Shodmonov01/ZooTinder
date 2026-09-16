import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  targetType: string;

  @IsString()
  targetId: string;

  @IsString()
  @MaxLength(80)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class CreateBlockDto {
  @IsString()
  blockedId: string;
}
