import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeGenerationService } from './code-generation.service';

@Module({
  imports: [ConfigModule],
  providers: [CodeGenerationService],
  exports: [CodeGenerationService],
})
export class CodeGenerationModule {}
