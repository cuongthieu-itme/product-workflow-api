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
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDTO, UpdateDTO, FilterUserDTO, UpdateProfileDTO } from './dtos';
import { AuthRequest } from 'src/common/types';

@ApiTags('User')
@AuthGuard()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Lấy profile người dùng hiện tại',
  })
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@Request() req: AuthRequest) {
    return this.userService.findOne(req.user.id);
  }

  @ApiOperation({
    summary: 'Cập nhật profile người dùng',
  })
  @HttpCode(HttpStatus.OK)
  @Put('profile')
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() dto: UpdateProfileDTO,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Lấy danh sách người dùng',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterUserDTO) {
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
