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
import { EvaluateService } from './evaluate.service';
import { CreateEvaluateDto, UpdateEvaluateDto, FilterEvaluateDto } from './dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Evaluate')
@AuthGuard()
@Controller('evaluates')
export class EvaluateController {
  constructor(private readonly evaluateService: EvaluateService) {}

  @ApiOperation({ summary: 'Lấy danh sách đánh giá' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterEvaluateDto) {
    return this.evaluateService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin đánh giá theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.evaluateService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Tạo đánh giá mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createEvaluateDto: CreateEvaluateDto) {
    return this.evaluateService.create(createEvaluateDto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin đánh giá' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateEvaluateDto: UpdateEvaluateDto,
  ) {
    return this.evaluateService.update(Number(id), updateEvaluateDto);
  }

  @ApiOperation({ summary: 'Xóa đánh giá' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.evaluateService.remove(Number(id));
  }
}
