import { PartialType } from '@nestjs/swagger';
import { CreateMaterialRequestSubprocessHistoryDto } from './create-material-request-subprocess-history.dto';

export class UpdateMaterialRequestSubprocessHistoryDto extends PartialType(
  CreateMaterialRequestSubprocessHistoryDto,
) {}
