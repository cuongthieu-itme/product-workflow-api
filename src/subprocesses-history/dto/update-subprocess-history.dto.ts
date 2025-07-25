import { PartialType } from '@nestjs/swagger';
import { CreateSubprocessHistoryDto } from './create-subprocess-history.dto';

export class UpdateSubprocessHistoryDto extends PartialType(CreateSubprocessHistoryDto) {}
