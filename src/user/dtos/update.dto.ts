import { CreateDTO } from './create.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDTO extends PartialType(CreateDTO) {}
