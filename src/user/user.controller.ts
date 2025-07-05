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
} from '@nestjs/common';
import { UserService } from './user.service';
import { IPaginationQuery } from 'src/common/types';
import { AuthGuard, PaginationQuery } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateDTO, UpdateDTO, FilterDTO } from './dtos';

@ApiTags('User')
@AuthGuard()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Lấy danh sách người dùng',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterDTO) {
    return this.userService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin người dùng theo ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo người dùng mới',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateDTO) {
    return this.userService.create(dto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin người dùng',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateDTO) {
    return this.userService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa người dùng',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
