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
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProcedureService } from './procedure.service';
import {
  CreateProcedureDto,
  UpdateProcedureDto,
  FilterProcedureDto,
  CreateOrUpdateProcedureDto,
} from './dto';
import { AuthGuard } from 'src/common/decorators';

@ApiTags('Procedure')
@AuthGuard()
@Controller('procedures')
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách quy trình' })
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    filters?: FilterProcedureDto,
  ) {
    return this.procedureService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin quy trình theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.procedureService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới' })
  async create(
    @Body(new ValidationPipe()) createProcedureDto: CreateProcedureDto,
  ) {
    return this.procedureService.create(createProcedureDto);
  }

  @Post('create-or-update')
  @ApiOperation({
    summary: 'Tạo mới hoặc cập nhật quy trình kèm quy trình con',
  })
  async createOrUpdate(
    @Body(new ValidationPipe())
    dto: CreateOrUpdateProcedureDto,
  ) {
    return this.procedureService.createOrUpdate(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật quy trình' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateProcedureDto: UpdateProcedureDto,
  ) {
    return this.procedureService.update(id, updateProcedureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.procedureService.remove(id);
  }
}
