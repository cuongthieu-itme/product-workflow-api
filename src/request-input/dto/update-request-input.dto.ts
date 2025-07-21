import { PartialType } from '@nestjs/swagger';
import { CreateRequestInputDto } from './create-request-input.dto';

export class UpdateRequestInputDto extends PartialType(CreateRequestInputDto) {}
