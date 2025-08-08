import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { CheckField } from '@prisma/client';

export class CreateFieldSubprocessDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  subprocessId?: number;

  // step-1 fields
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
  @IsDateString()
  requestDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requestSource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descriptionMaterial?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialType?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  purchaseLink?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalNote?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  approvedTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purchaser?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  purchasingTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  receivedQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checkedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkedTime?: string;

  // step-2 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleProductionPlan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  designer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completedTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productionFileLink?: string;

  // step-3 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleMaker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleStatus?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  sampleMediaLink?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  finalApprovedSampleImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  finalProductVideo?: string;

  // step-4 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productManufacturingPlan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productFeedbackResponder?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadlineChecking?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productFeedbackStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reasonForNonProduction?: string;

  // step-5 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleFeedbackResponder?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  demoPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleFeedback?: string;

  // checkField array
  @ApiProperty({ required: false, type: [String], enum: CheckField })
  @IsOptional()
  @IsArray()
  @IsEnum(CheckField, { each: true })
  checkField?: CheckField[];
}
