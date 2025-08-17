import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestMaterialStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MaterialStatusUpdateItem {
  @ApiProperty({ description: 'ID của vật liệu' })
  @IsNumber()
  id: number;

  @ApiProperty({ 
    description: 'Trạng thái mới của vật liệu',
    enum: RequestMaterialStatus 
  })
  @IsEnum(RequestMaterialStatus)
  status: RequestMaterialStatus;
}

export class UpdateMaterialStatusDto {
  @ApiProperty({ 
    description: 'Danh sách vật liệu cần cập nhật trạng thái',
    type: [MaterialStatusUpdateItem]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialStatusUpdateItem)
  materials: MaterialStatusUpdateItem[];
}
