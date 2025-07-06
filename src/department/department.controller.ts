import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Body,
  Post,
  HttpStatus,
  HttpCode,
  Query,
  Patch,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  FilterDepartmentDTO,
} from './dtos';

@ApiTags('Department')
@AuthGuard()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiOperation({
    summary: 'Lấy danh sách phòng ban',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterDepartmentDTO) {
    return this.departmentService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin phòng ban theo ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.departmentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo phòng ban mới',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateDepartmentDTO) {
    return this.departmentService.create(dto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin phòng ban',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateDepartmentDTO) {
    return this.departmentService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa phòng ban',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.departmentService.delete(id);
  }

  @ApiOperation({
    summary: 'Phân công người dùng vào phòng ban',
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':departmentId/assign-user/:userId')
  async assignUserToDepartment(
    @Param('departmentId') departmentId: number,
    @Param('userId') userId: number,
  ) {
    return this.departmentService.assignUserToDepartment(userId, departmentId);
  }

  @ApiOperation({
    summary: 'Loại bỏ người dùng khỏi phòng ban',
  })
  @HttpCode(HttpStatus.OK)
  @Patch('remove-user/:userId')
  async removeUserFromDepartment(@Param('userId') userId: number) {
    return this.departmentService.removeUserFromDepartment(userId);
  }
}
