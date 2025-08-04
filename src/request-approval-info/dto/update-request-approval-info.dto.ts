import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestApprovalInfoDto } from './create-request-approval-info.dto';

export class UpdateRequestApprovalInfoDto extends PartialType(
  CreateRequestApprovalInfoDto,
) {}
