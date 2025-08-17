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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/decorators';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@AuthGuard()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterProductDto) {
    return this.productService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin sản phẩm theo ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo sản phẩm mới',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    console.log('createProductDto', createProductDto);
    return this.productService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @ApiOperation({
    summary: 'Xóa sản phẩm',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
