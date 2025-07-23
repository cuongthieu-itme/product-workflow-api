import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SubprocessesHistoryService } from './subprocesses-history.service';
import {
  CreateSubprocessesHistoryDto,
  UpdateSubprocessesHistoryDto,
  FilterSubprocessesHistoryDto,
} from './dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('SubprocessesHistory')
@AuthGuard()
@Controller('subprocesses-history')
export class SubprocessesHistoryController {
  constructor(
    private readonly subprocessesHistoryService: SubprocessesHistoryService,
  ) {}

  @ApiOperation({ summary: 'Lấy danh sách lịch sử quy trình' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterSubprocessesHistoryDto) {
    return this.subprocessesHistoryService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin lịch sử quy trình theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subprocessesHistoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo lịch sử quy trình mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createDto: CreateSubprocessesHistoryDto) {
    return this.subprocessesHistoryService.create(createDto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin lịch sử quy trình' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubprocessesHistoryDto,
  ) {
    return this.subprocessesHistoryService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Xóa lịch sử quy trình' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.subprocessesHistoryService.remove(id);
  }
}
