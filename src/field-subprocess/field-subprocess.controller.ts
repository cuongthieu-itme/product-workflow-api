import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FieldSubprocessService } from './field-subprocess.service';
import { CreateFieldSubprocessDto } from './dto/create-field-subprocess.dto';
import { UpdateFieldSubprocessDto } from './dto/update-field-subprocess.dto';
import { FilterFieldSubprocessDto } from './dto/filter-field-subprocess.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('FieldSubprocess')
@AuthGuard()
@Controller('field-subprocess')
export class FieldSubprocessController {
  constructor(
    private readonly fieldSubprocessService: FieldSubprocessService,
  ) {}

  @Get()
  async findAll(@Query() query: FilterFieldSubprocessDto) {
    return this.fieldSubprocessService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fieldSubprocessService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateFieldSubprocessDto) {
    return this.fieldSubprocessService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFieldSubprocessDto,
  ) {
    return this.fieldSubprocessService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.fieldSubprocessService.remove(id);
  }
}
