import { PartialType } from '@nestjs/swagger';
import { CreateEvaluateDto } from './create-evaluate.dto';

export class UpdateEvaluateDto extends PartialType(CreateEvaluateDto) {}
