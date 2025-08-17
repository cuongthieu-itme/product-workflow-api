import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FilterMaterialDto } from './dto/filter-material.dto';
import { UpdateMaterialStatusDto } from './dto/update-material-status.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Material')
@AuthGuard()
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @ApiOperation({ summary: 'Lấy danh sách vật liệu' })
  @Get()
  async findAll(@Query() filters: FilterMaterialDto) {
    return this.materialService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin vật liệu theo ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.materialService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo vật liệu mới' })
  @Post()
  async create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật vật liệu' })
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa vật liệu' })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.materialService.remove(id);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái nhiều vật liệu' })
  @Put('update-status')
  async updateStatus(@Body() dto: UpdateMaterialStatusDto) {
    return this.materialService.updateStatus(dto);
  }
}
