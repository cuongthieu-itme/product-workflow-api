import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RequestApprovalInfoService } from './request-approval-info.service';
import {
  CreateRequestApprovalInfoDto,
  UpdateRequestApprovalInfoDto,
  FilterRequestApprovalInfoDto,
} from './dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthRequest } from 'src/common/types/auth-request.type';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Request Approval Info')
@UseGuards(AccessTokenGuard)
@Controller('request-approval-infos')
export class RequestApprovalInfoController {
  constructor(
    private readonly requestApprovalInfoService: RequestApprovalInfoService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông tin phê duyệt yêu cầu' })
  findAll(@Query() filters?: FilterRequestApprovalInfoDto) {
    return this.requestApprovalInfoService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin phê duyệt theo ID' })
  findOne(@Param('id') id: string) {
    return this.requestApprovalInfoService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thông tin phê duyệt yêu cầu' })
  create(
    @Body() createRequestApprovalInfoDto: CreateRequestApprovalInfoDto,
    @Request() req: AuthRequest,
  ) {
    return this.requestApprovalInfoService.create(
      createRequestApprovalInfoDto,
      req.user?.id,
    );
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'Lấy thông tin phê duyệt theo ID yêu cầu' })
  findByRequestId(@Param('requestId') requestId: string) {
    return this.requestApprovalInfoService.findByRequestId(+requestId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin phê duyệt yêu cầu' })
  update(
    @Param('id') id: string,
    @Body() updateRequestApprovalInfoDto: UpdateRequestApprovalInfoDto,
  ) {
    return this.requestApprovalInfoService.update(
      +id,
      updateRequestApprovalInfoDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông tin phê duyệt yêu cầu' })
  remove(@Param('id') id: string) {
    return this.requestApprovalInfoService.remove(+id);
  }
}
