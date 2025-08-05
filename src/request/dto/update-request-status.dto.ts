import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
} from 'class-validator';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  statusProductId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  productionPlan?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  holdReason?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  denyReason?: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];
}
