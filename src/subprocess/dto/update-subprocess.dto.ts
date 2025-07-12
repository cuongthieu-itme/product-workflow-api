import { PartialType } from '@nestjs/swagger';
import { CreateSubprocessDto } from './create-subprocess.dto';

export class UpdateSubprocessDto extends PartialType(CreateSubprocessDto) {}
