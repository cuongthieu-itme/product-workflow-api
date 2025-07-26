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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly, AuthGuard } from 'src/common/decorators';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';

@ApiTags('Category')
@AuthGuard()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @Get()
  async findAll(@Query() filters: FilterCategoryDto) {
    return this.categoryService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin danh mục theo ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @Post()
  @AdminOnly()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin danh mục' })
  @Put(':id')
  @AdminOnly()
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Xóa danh mục' })
  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
}
