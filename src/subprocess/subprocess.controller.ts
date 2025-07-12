import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubprocessService } from './subprocess.service';
import {
  CreateSubprocessDto,
  UpdateSubprocessDto,
  FilterSubprocessDto,
} from './dto';
import { AuthGuard } from 'src/common/decorators';

@ApiTags('Subprocess')
@Controller('subprocess')
@AuthGuard()
export class SubprocessController {
  constructor(private readonly subprocessService: SubprocessService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả quy trình con' })
  async findAll(@Query() filters: FilterSubprocessDto) {
    return this.subprocessService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin quy trình con theo ID' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy subprocess với ID đã cho',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subprocessService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình con mới' })
  async create(@Body() createSubprocessDto: CreateSubprocessDto) {
    return this.subprocessService.create(createSubprocessDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật quy trình con theo ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubprocessDto: UpdateSubprocessDto,
  ) {
    return this.subprocessService.update(id, updateSubprocessDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình con theo ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.subprocessService.remove(id);
  }
}
