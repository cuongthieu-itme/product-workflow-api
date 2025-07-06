import { PartialType } from '@nestjs/swagger';
import { CreateStatusProductDTO } from './create-status-product.dto';

export class UpdateStatusProductDto extends PartialType(
  CreateStatusProductDTO,
) {}
