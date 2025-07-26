import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateEvaluateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reviewType: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsInt()
  score?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  requestId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  createdById?: number;
}
