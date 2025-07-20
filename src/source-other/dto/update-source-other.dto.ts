import { PartialType } from '@nestjs/swagger';
import { CreateSourceOtherDto } from './create-source-other.dto';

export class UpdateSourceOtherDto extends PartialType(CreateSourceOtherDto) {}
