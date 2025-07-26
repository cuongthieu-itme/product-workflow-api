import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Body,
  Post,
  Query,
  Patch,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AdminOnly, AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  FilterDepartmentDTO,
} from './dto';

@ApiTags('Department')
@AuthGuard()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiOperation({
    summary: 'Lấy danh sách phòng ban',
  })
  @Get()
  async findAll(@Query() filters: FilterDepartmentDTO) {
    return this.departmentService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin phòng ban theo ID',
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.departmentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo phòng ban mới',
  })
  @Post()
  @AdminOnly()
  async create(@Body() dto: CreateDepartmentDTO) {
    return this.departmentService.create(dto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin phòng ban',
  })
  @Put(':id')
  @AdminOnly()
  async update(@Param('id') id: number, @Body() dto: UpdateDepartmentDTO) {
    return this.departmentService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa phòng ban',
  })
  @Delete(':id')
  @AdminOnly()
  async delete(@Param('id') id: number) {
    return this.departmentService.delete(id);
  }

  @ApiOperation({
    summary: 'Phân công người dùng vào phòng ban',
  })
  @Patch(':departmentId/assign-user/:userId')
  @AdminOnly()
  async assignUserToDepartment(
    @Param('departmentId') departmentId: number,
    @Param('userId') userId: number,
  ) {
    return this.departmentService.assignUserToDepartment(userId, departmentId);
  }

  @ApiOperation({
    summary: 'Loại bỏ người dùng khỏi phòng ban',
  })
  @Patch('remove-user/:userId')
  @AdminOnly()
  async removeUserFromDepartment(@Param('userId') userId: number) {
    return this.departmentService.removeUserFromDepartment(userId);
  }
}
