import {
  Body,
  ValidationPipe,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Patch,
  Request,
} from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CreateNotificationAdminDto } from './dto/create-broadcast.dto';
import { UpdateNotificationAdminDto } from './dto/update-broadcast.dto';
import { FilterNotificationAdminDto } from './dto/filter-broadcast.dto';
import { UpdateIsReadDto } from './dto/update-is-read.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRequest } from 'src/common/types/auth-request.type';

@ApiTags('Broadcast')
@AuthGuard()
@Controller('broadcasts')
export class BroadcastController {
  constructor(private readonly notificationAdminService: BroadcastService) {}

  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() filters: FilterNotificationAdminDto,
    @Request() req: AuthRequest,
  ) {
    return this.notificationAdminService.findAll(filters, req.user.id);
  }

  @ApiOperation({
    summary: 'Lấy tất cả thông báo theo userId (không phân trang)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('user')
  async findAllByUser(@Request() req: AuthRequest) {
    return this.notificationAdminService.findAllByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Lấy thông tin thông báo theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req: AuthRequest) {
    return this.notificationAdminService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Tạo thông báo mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() dto: CreateNotificationAdminDto,
    @Request() req: AuthRequest,
  ) {
    return this.notificationAdminService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông báo' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateNotificationAdminDto,
    @Request() req: AuthRequest,
  ) {
    return this.notificationAdminService.update(id, req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái đã đọc' })
  @HttpCode(HttpStatus.OK)
  @Patch('is-read')
  updateIsRead(
    @Body(new ValidationPipe({ whitelist: true }))
    dto: UpdateIsReadDto,
    @Request() req: AuthRequest,
  ) {
    return this.notificationAdminService.updateIsRead(req.user.id, dto.ids);
  }

  @ApiOperation({ summary: 'Xóa thông báo' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req: AuthRequest) {
    return this.notificationAdminService.remove(id, req.user.id);
  }
}
