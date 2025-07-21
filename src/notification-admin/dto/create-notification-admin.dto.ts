import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationAdminDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;
}
