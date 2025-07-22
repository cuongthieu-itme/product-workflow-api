import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NotificationAdminService } from './notification-admin.service';
import { CreateNotificationAdminDto } from './dto/create-notification-admin.dto';
import { UpdateNotificationAdminDto } from './dto/update-notification-admin.dto';
import { FilterNotificationAdminDto } from './dto/filter-notification-admin.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('NotificationAdmin')
@AuthGuard()
@Controller('notification-admins')
export class NotificationAdminController {
  constructor(
    private readonly notificationAdminService: NotificationAdminService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterNotificationAdminDto) {
    return this.notificationAdminService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin thông báo theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.notificationAdminService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo thông báo mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateNotificationAdminDto) {
    return this.notificationAdminService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông báo' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateNotificationAdminDto,
  ) {
    return this.notificationAdminService.update(id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái đã đọc' })
  @HttpCode(HttpStatus.OK)
  @Put('is-read')
  async updateIsRead(@Body('ids') ids: number[]) {
    return this.notificationAdminService.updateIsRead(ids);
  }

  @ApiOperation({ summary: 'Xóa thông báo' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.notificationAdminService.remove(id);
  }
}
