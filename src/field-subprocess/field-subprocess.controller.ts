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
import { DeleteMultipleFieldSubprocessDto } from './dto/delete-multiple.dto';
import { BulkUpdateFieldSubprocessDto } from './dto/bulk-update.dto';
import { UpdateOrCreateCheckFieldDto } from './dto/update-or-create-check-field.dto';
import { CheckFieldResponseDto } from './dto/check-field-response.dto';
import { CheckFieldOptionDto } from './dto/check-field-option.dto';
import { CheckFieldOptionsResponseDto } from './dto/check-field-options-response.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('FieldSubprocess')
@AuthGuard()
@Controller('field-subprocess')
export class FieldSubprocessController {
  constructor(
    private readonly fieldSubprocessService: FieldSubprocessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các trường tiến trình' })
  async findAll(@Query() query: FilterFieldSubprocessDto) {
    return this.fieldSubprocessService.findAll(query);
  }

  @Get('check-field-options')
  @ApiOperation({
    summary: 'Lấy danh sách các CheckField với label tiếng Việt và type',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách CheckField thành công',
    type: CheckFieldOptionsResponseDto,
  })
  async getCheckFieldOptions(): Promise<{ data: CheckFieldOptionDto[] }> {
    return this.fieldSubprocessService.getCheckFieldOptions();
  }

  @Get('subprocess/:subprocessId')
  @ApiOperation({ summary: 'Lấy các trường tiến trình theo subprocess ID' })
  async findBySubprocessId(
    @Param('subprocessId', ParseIntPipe) subprocessId: number,
  ) {
    return this.fieldSubprocessService.findBySubprocessId(subprocessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một trường tiến trình' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fieldSubprocessService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới một trường tiến trình' })
  async create(@Body() dto: CreateFieldSubprocessDto) {
    return this.fieldSubprocessService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo hàng loạt các trường tiến trình' })
  async bulkCreate(@Body() dtos: CreateFieldSubprocessDto[]) {
    return this.fieldSubprocessService.bulkCreate(dtos);
  }

  @Post('check-field')
  @ApiOperation({
    summary: 'Cập nhật hoặc tạo mới checkField theo subprocessId',
  })
  async updateOrCreateCheckField(@Body() dto: UpdateOrCreateCheckFieldDto) {
    return this.fieldSubprocessService.updateOrCreateCheckField(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật một trường tiến trình' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFieldSubprocessDto,
  ) {
    return this.fieldSubprocessService.update(id, dto);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Cập nhật hàng loạt các trường tiến trình' })
  async bulkUpdate(@Body() body: BulkUpdateFieldSubprocessDto) {
    return this.fieldSubprocessService.bulkUpdate(body.ids, body.data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một trường tiến trình' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.fieldSubprocessService.remove(id);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Xóa hàng loạt các trường tiến trình' })
  async bulkRemove(@Body() body: DeleteMultipleFieldSubprocessDto) {
    return this.fieldSubprocessService.bulkRemove(body.ids);
  }
}
