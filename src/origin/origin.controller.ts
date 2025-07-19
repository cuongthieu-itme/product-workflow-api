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
import { OriginService } from './origin.service';
import { CreateOriginDto, UpdateOriginDto, FilterOriginDto } from './dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Origin')
@AuthGuard()
@Controller('origins')
export class OriginController {
  constructor(private readonly originService: OriginService) {}

  @ApiOperation({ summary: 'Lấy danh sách xuất xứ' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterOriginDto) {
    return this.originService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin xuất xứ theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.originService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo xuất xứ mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateOriginDto) {
    return this.originService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật xuất xứ' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateOriginDto) {
    return this.originService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa xuất xứ' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.originService.remove(id);
  }
}
