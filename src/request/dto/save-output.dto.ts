import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { OutputType } from '@prisma/client';

export class SaveOutputDto {
  @IsNotEmpty()
  @IsEnum(OutputType)
  outputType: OutputType;

  @ValidateIf((o) => o.outputType === 'PRODUCT')
  @IsNotEmpty()
  @IsString()
  productName?: string;

  @ValidateIf((o) => o.outputType === 'PRODUCT')
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ValidateIf((o) => o.outputType === 'PRODUCT')
  @IsNotEmpty()
  @IsNumber()
  categoryId?: number;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsNotEmpty()
  @IsString()
  materialName?: string;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsNotEmpty({
    message:
      'Mã nguyên vật liệu là bắt buộc khi outputType là INGREDIENT hoặc ACCESSORY',
  })
  @IsString()
  materialCode?: string;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsNotEmpty()
  @IsNumber()
  materialQuantity?: number;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsNotEmpty()
  @IsString()
  materialUnit?: string;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsOptional()
  @IsString()
  materialDescription?: string;

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialImages?: string[];

  @ValidateIf(
    (o) => o.outputType === 'INGREDIENT' || o.outputType === 'ACCESSORY',
  )
  @IsNotEmpty()
  @IsNumber()
  originId?: number;
}
