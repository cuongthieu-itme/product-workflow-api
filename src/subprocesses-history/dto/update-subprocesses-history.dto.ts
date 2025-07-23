import { PartialType } from '@nestjs/swagger';
import { CreateSubprocessesHistoryDto } from './create-subprocesses-history.dto';

export class UpdateSubprocessesHistoryDto extends PartialType(
  CreateSubprocessesHistoryDto,
) {}
