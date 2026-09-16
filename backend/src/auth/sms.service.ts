import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOtp(phone: string, code: string) {
    const masked = phone.replace(/.(?=.{4})/g, '*');
    const url = this.config.get<string>('SMS_API_URL');
    if (!url) {
      this.logger.warn(`SMS provider is not configured; OTP for ${masked} was generated`);
      return;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.get('SMS_API_KEY')
          ? { Authorization: `Bearer ${this.config.get('SMS_API_KEY')}` }
          : {}),
      },
      body: JSON.stringify({
        phone,
        text: `BreedMatch code: ${code}`,
      }),
    });
    if (!response.ok) {
      this.logger.error(`SMS send failed for ${masked}: ${response.status}`);
    }
  }
}
