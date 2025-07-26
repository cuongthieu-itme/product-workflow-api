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
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddMaterialToRequestDto } from './dto/create-request.dto';
import { RemoveMaterialFromRequestDto } from './dto/create-request.dto';

@ApiTags('Request')
@AuthGuard()
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterRequestDto) {
    return this.requestService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin yêu cầu theo ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.requestService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo yêu cầu mới',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin yêu cầu',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.update(id, updateRequestDto);
  }

  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requestService.updateStatusAndSaveHistory(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa yêu cầu',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.requestService.remove(id);
  }

  @ApiOperation({
    summary: 'Lấy tất cả yêu cầu theo statusProductId',
  })
  @HttpCode(HttpStatus.OK)
  @Get('by-status-product/:statusProductId')
  async findByStatusProductIdWithHistory(
    @Param('statusProductId') statusProductId: number,
  ) {
    return this.requestService.findByStatusProductIdWithHistory(
      Number(statusProductId),
    );
  }

  @ApiOperation({ summary: 'Thêm material vào request' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/material')
  async addMaterial(
    @Param('id') id: number,
    @Body() dto: AddMaterialToRequestDto,
  ) {
    return this.requestService.addMaterial(Number(id), dto);
  }

  @ApiOperation({ summary: 'Xoá material khỏi request' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id/material')
  async removeMaterial(
    @Param('id') id: number,
    @Body() dto: RemoveMaterialFromRequestDto,
  ) {
    return this.requestService.removeMaterial(Number(id), dto);
  }

  @ApiOperation({
    summary: 'Thống kê số lượng request theo từng trạng thái',
  })
  @HttpCode(HttpStatus.OK)
  @Get('statistics-by-status')
  async getStatisticsByStatus() {
    return this.requestService.getRequestStatisticsByStatus();
  }
}
