import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubprocessesHistoryService } from './subprocesses-history.service';
import {
  CreateSubprocessHistoryDto,
  UpdateSubprocessHistoryDto,
  FilterSubprocessHistoryDto,
  UpdateSubprocessHistoryStatusDto,
} from './dto/index';
import { AdminOnly, AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateSubprocessHistoryIsApprovedDto } from './dto/update-subprocess-history-is-approved.dto';

@ApiTags('SubprocessesHistory')
@AuthGuard()
@Controller('subprocesses-history')
export class SubprocessesHistoryController {
  constructor(
    private readonly subprocessesHistoryService: SubprocessesHistoryService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách subprocess history' })
  @Get()
  async findAll(@Query() filters: FilterSubprocessHistoryDto) {
    return this.subprocessesHistoryService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin subprocess history theo ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.subprocessesHistoryService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Tạo subprocess history mới' })
  @Post()
  async create(@Body() dto: CreateSubprocessHistoryDto) {
    return this.subprocessesHistoryService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật subprocess history' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateSubprocessHistoryDto,
  ) {
    return this.subprocessesHistoryService.update(Number(id), dto);
  }

  @ApiOperation({ summary: 'Xóa subprocess history' })
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateSubprocessHistoryStatusDto,
  ) {
    return this.subprocessesHistoryService.updateStatus(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.subprocessesHistoryService.remove(Number(id));
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái subprocess history' })
  @Put(':id/is-approved')
  @AdminOnly()
  async updateIsApproved(
    @Param('id') id: number,
    @Body() dto: UpdateSubprocessHistoryIsApprovedDto,
  ) {
    return this.subprocessesHistoryService.updateIsApproved(Number(id), dto);
  }
}
