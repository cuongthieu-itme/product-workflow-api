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
    return this.requestService.updateStatus(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa yêu cầu',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.requestService.remove(id);
  }
}
