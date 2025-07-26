import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDTO } from './create-department.dto';

export class UpdateDepartmentDTO extends PartialType(CreateDepartmentDTO) {}
