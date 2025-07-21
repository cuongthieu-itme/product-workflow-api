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
import { RequestInputService } from './request-input.service';
import { CreateRequestInputDto } from './dto/create-request-input.dto';
import { UpdateRequestInputDto } from './dto/update-request-input.dto';
import { FilterRequestInputDto } from './dto/filter-request-input.dto';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('RequestInput')
@AuthGuard()
@Controller('request-inputs')
export class RequestInputController {
  constructor(private readonly requestInputService: RequestInputService) {}

  @ApiOperation({ summary: 'Lấy danh sách yêu cầu nhập' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@Query() filters: FilterRequestInputDto) {
    return this.requestInputService.findAll(filters);
  }

  @ApiOperation({ summary: 'Lấy thông tin yêu cầu nhập theo ID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.requestInputService.findOne(id);
  }

  @ApiOperation({ summary: 'Tạo yêu cầu nhập mới' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateRequestInputDto) {
    return this.requestInputService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật yêu cầu nhập' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateRequestInputDto) {
    return this.requestInputService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa yêu cầu nhập' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.requestInputService.remove(id);
  }
}
