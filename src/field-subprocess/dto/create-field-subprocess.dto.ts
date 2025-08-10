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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  subprocessesHistoryId?: number;

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

  // step-6 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  MOQInput?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sizeDimension?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialConfirmer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purchaseStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  confirmedQuantity?: string;

  // step-7 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderPlaced?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  estimatedArrivalDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  actualArrivalDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  warehouseChecker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  quantityReceived?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkedDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialSentToRD?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  sentDateToRD?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  receivedDateByRD?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  RDMaterialChecker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sampleQualityFeedback?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  feedbackDate?: string;

  // step-8 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startedTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkTemplateMockup?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateChecker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateCheckingStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mockupChecker?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mockupCheckingStatus?: string;

  // step-9 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  priceCalculator?: number;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  priceList?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variant?: string;

  // step-10 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  estimatedUploadDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  actualUploadTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productPageLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  SKU?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  SKUDescription?: string;

  // step-11 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  howToProduce?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialNeedToUse?: string;

  // step-12 fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  groupAnnouncementAllDepartments?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  announcementOfRndWorkshopGroup?: string;

  // checkField array
  @ApiProperty({ required: false, type: [String], enum: CheckField })
  @IsOptional()
  @IsArray()
  @IsEnum(CheckField, { each: true })
  checkFields?: CheckField[];
}
