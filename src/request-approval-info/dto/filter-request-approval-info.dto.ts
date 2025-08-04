import { IsEnum, IsNumber, IsOptional, IsString, IsInt } from 'class-validator';
import { RequestApprovalStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterRequestApprovalInfoDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  requestId?: number;

  @ApiProperty({ required: false })
  @IsEnum(RequestApprovalStatus)
  @IsOptional()
  status?: RequestApprovalStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  approvedType?: string;

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
