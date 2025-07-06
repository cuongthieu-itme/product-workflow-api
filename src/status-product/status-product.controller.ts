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
import { StatusProductService } from './status-product.service';
import { CreateStatusProductDTO } from './dto/create-status-product.dto';
import { UpdateStatusProductDto } from './dto/update-status-product.dto';
import { FilterStatusProductDTO } from './dto/filter-status-product.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Status Product')
@AuthGuard()
@Controller('status-products')
export class StatusProductController {
  constructor(private readonly statusProductService: StatusProductService) {}

  @ApiOperation({
    summary: 'Lấy danh sách trạng thái sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterStatusProductDTO) {
    return this.statusProductService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin trạng thái sản phẩm theo ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.statusProductService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo trạng thái sản phẩm mới',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createStatusProductDto: CreateStatusProductDTO) {
    return this.statusProductService.create(createStatusProductDto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin trạng thái sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStatusProductDto: UpdateStatusProductDto,
  ) {
    return this.statusProductService.update(id, updateStatusProductDto);
  }

  @ApiOperation({
    summary: 'Xóa trạng thái sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.statusProductService.remove(id);
  }
}
