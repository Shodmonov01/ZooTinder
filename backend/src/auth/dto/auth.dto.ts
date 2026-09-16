import { IsString, Length, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'Phone must be in E.164 format, e.g. +998901234567',
  })
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone: string;

  @IsString()
  @Length(4, 8)
  code: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
