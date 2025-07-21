import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional, IsDateString, Min, MinLength } from 'class-validator';

export class CreateRequestInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  expectedDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  supplier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  sourceCountry: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  reason?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  materialId: number;
}
