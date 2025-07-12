import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessoryService } from './accessory.service';
import {
  CreateAccessoryDto,
  UpdateAccessoryDto,
  FilterAccessoryDto,
} from './dto';
import { AuthGuard } from 'src/common/decorators';

@ApiTags('Accessory')
@Controller('accessories')
@AuthGuard()
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo phụ kiện mới' })
  create(@Body() createAccessoryDto: CreateAccessoryDto) {
    return this.accessoryService.create(createAccessoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phụ kiện' })
  findAll(@Query() filterAccessoryDto: FilterAccessoryDto) {
    return this.accessoryService.findAll(filterAccessoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin phụ kiện theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accessoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật phụ kiện' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccessoryDto: UpdateAccessoryDto,
  ) {
    return this.accessoryService.update(id, updateAccessoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phụ kiện' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accessoryService.remove(id);
  }
}
