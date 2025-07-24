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
} from '@nestjs/common';
import { SubprocessesHistoryService } from './subprocesses-history.service';
import {
  CreateSubprocessHistoryDto,
  UpdateSubprocessHistoryDto,
  FilterSubprocessHistoryDto,
} from './dto/index';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('SubprocessesHistory')
@AuthGuard()
@Controller('subprocesses-history')
export class SubprocessesHistoryController {
  constructor(private readonly subprocessesHistoryService: SubprocessesHistoryService) {}

  @ApiOperation({ summary: 'Lấy danh sách subprocess history' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterSubprocessHistoryDto) {
    return this.subprocessesHistoryService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin subprocess history theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.subprocessesHistoryService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Tạo subprocess history mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateSubprocessHistoryDto) {
    return this.subprocessesHistoryService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật subprocess history' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateSubprocessHistoryDto,
  ) {
    return this.subprocessesHistoryService.update(Number(id), dto);
  }

  @ApiOperation({ summary: 'Xóa subprocess history' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.subprocessesHistoryService.remove(Number(id));
  }
}
