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
import { SourceOtherService } from './source-other.service';
import { CreateSourceOtherDto, UpdateSourceOtherDto, FilterSourceOtherDto } from './dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Source Other')
@AuthGuard()
@Controller('source-others')
export class SourceOtherController {
  constructor(private readonly sourceOtherService: SourceOtherService) {}

  @ApiOperation({ summary: 'Lấy danh sách nguồn khác' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterSourceOtherDto) {
    return this.sourceOtherService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin nguồn khác theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.sourceOtherService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo nguồn khác mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateSourceOtherDto) {
    return this.sourceOtherService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật nguồn khác' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateSourceOtherDto) {
    return this.sourceOtherService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa nguồn khác' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.sourceOtherService.remove(id);
  }
}
