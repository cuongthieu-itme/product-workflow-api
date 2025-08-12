import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckField } from '@prisma/client';

export class FilterFieldSubprocessDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  subprocessId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  requestId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productFeedbackStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CheckField)
  checkField?: CheckField;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
