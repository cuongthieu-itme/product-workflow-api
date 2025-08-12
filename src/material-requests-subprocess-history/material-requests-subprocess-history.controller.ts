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
import { MaterialRequestsSubprocessHistoryService } from './material-requests-subprocess-history.service';
import { AuthGuard } from 'src/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateMaterialRequestSubprocessHistoryDto,
  FilterMaterialRequestSubprocessHistoryDto,
  UpdateMaterialRequestSubprocessHistoryDto,
} from './dto/index';

@ApiTags('MaterialRequestSubprocessHistory')
@AuthGuard()
@Controller('material-requests-subprocess-history')
export class MaterialRequestsSubprocessHistoryController {
  constructor(
    private readonly materialRequestsSubprocessHistoryService: MaterialRequestsSubprocessHistoryService,
  ) {}

  @ApiOperation({
    summary: 'Lấy danh sách material request subprocess history',
  })
  @Get()
  async findAll(@Query() filters: FilterMaterialRequestSubprocessHistoryDto) {
    return this.materialRequestsSubprocessHistoryService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin theo ID' })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.materialRequestsSubprocessHistoryService.findOne(Number(id));
  }

  @ApiOperation({ summary: 'Tạo mới' })
  @Post()
  async create(@Body() dto: CreateMaterialRequestSubprocessHistoryDto) {
    return this.materialRequestsSubprocessHistoryService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateMaterialRequestSubprocessHistoryDto,
  ) {
    return this.materialRequestsSubprocessHistoryService.update(
      Number(id),
      dto,
    );
  }

  @ApiOperation({ summary: 'Xóa' })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.materialRequestsSubprocessHistoryService.remove(Number(id));
  }
}
