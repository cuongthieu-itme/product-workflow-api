import { IsArray, IsNotEmpty, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteMultipleDto {
  @ApiProperty({ type: [String], description: 'Array of filenames to delete' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  filenames: string[];
}
