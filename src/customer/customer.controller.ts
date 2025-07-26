import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { AuthRequest } from 'src/common/types/auth-request.type';
import { AuthGuard } from 'src/common/decorators';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Customer')
@AuthGuard()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({
    summary: 'Lấy danh sách khách hàng',
  })
  @Get()
  async findAll(@Query() filters: FilterCustomerDto) {
    return this.customerService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Lấy thông tin khách hàng theo ID',
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.customerService.findOne(id);
  }

  @ApiOperation({
    summary: 'Tạo khách hàng mới',
  })
  @Post()
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: AuthRequest,
  ) {
    return this.customerService.create(req.user.id, createCustomerDto);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin khách hàng',
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @ApiOperation({
    summary: 'Xóa khách hàng',
  })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.customerService.remove(id);
  }
}
