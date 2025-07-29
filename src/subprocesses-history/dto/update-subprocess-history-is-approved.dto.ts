import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSubprocessHistoryIsApprovedDto {
  @ApiProperty()
  @IsBoolean()
  isApproved: boolean;
}
