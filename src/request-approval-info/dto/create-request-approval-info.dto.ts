import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { RequestApprovalStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestApprovalInfoDto {
  @ApiProperty({ required: true })
  @IsNumber()
  requestId: number;

  @ApiProperty({ required: false })
  @IsEnum(RequestApprovalStatus)
  @IsOptional()
  status?: RequestApprovalStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  holdReason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  denyReason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  approvedType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  productionPlan?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];
}
