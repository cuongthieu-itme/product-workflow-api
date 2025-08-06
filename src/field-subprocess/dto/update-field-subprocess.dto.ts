import { PartialType } from '@nestjs/swagger';
import { CreateFieldSubprocessDto } from './create-field-subprocess.dto';

export class UpdateFieldSubprocessDto extends PartialType(CreateFieldSubprocessDto) {}