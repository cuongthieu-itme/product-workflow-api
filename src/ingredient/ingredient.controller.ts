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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IngredientService } from './ingredient.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  FilterIngredientDto,
} from './dto';
import { AccessTokenGuard } from 'src/auth/guards';

@ApiTags('Ingredient')
@Controller('ingredients')
@UseGuards(AccessTokenGuard)
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nguyên liệu mới' })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nguyên liệu' })
  findAll(@Query() filterIngredientDto: FilterIngredientDto) {
    return this.ingredientService.findAll(filterIngredientDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin nguyên liệu theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật nguyên liệu' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientService.remove(id);
  }
}
