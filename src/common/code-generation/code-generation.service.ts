import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CodeGenerationService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  async generateRequestCode(source: string): Promise<string> {
    const today = new Date();
    const dateStr = this.formatDate(today);
    const sourceCode = this.getSourceCode(source);

    const redisKey = `request_counter:${today.toISOString().split('T')[0]}:${sourceCode}`;

    const counter = await this.redis.incr(redisKey);

    await this.redis.expire(redisKey, 2 * 24 * 60 * 60);

    const formattedCounter = counter.toString().padStart(3, '0');

    return `${sourceCode}-${dateStr}-${formattedCounter}`;
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${day}${month}${year}`;
  }

  private getSourceCode(source: string): string {
    switch (source) {
      case 'CUSTOMER':
        return 'RD'; // Research & Development
      case 'OTHER':
        return 'SA'; // Sales/Other
      default:
        return 'OT'; // Other
    }
  }

  async getCurrentCounter(source: string): Promise<number> {
    const today = new Date();
    const sourceCode = this.getSourceCode(source);
    const redisKey = `request_counter:${today.toISOString().split('T')[0]}:${sourceCode}`;

    const counter = await this.redis.get(redisKey);
    return counter ? parseInt(counter) : 0;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
