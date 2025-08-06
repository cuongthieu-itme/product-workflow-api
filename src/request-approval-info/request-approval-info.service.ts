import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestApprovalInfoDto } from './dto/create-request-approval-info.dto';
import { UpdateRequestApprovalInfoDto } from './dto/update-request-approval-info.dto';
import { FilterRequestApprovalInfoDto } from './dto/filter-request-approval-info.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class RequestApprovalInfoService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterRequestApprovalInfoDto) {
    try {
      const whereCondition: any = {};

      if (filters) {
        if (filters.requestId) {
          whereCondition.requestId = filters.requestId;
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const total = await this.prismaService.requestApprovalInfo.count({
        where: whereCondition,
      });

      const data = await this.prismaService.requestApprovalInfo.findMany({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestId: true,
          holdReason: true,
          denyReason: true,
          files: true,
          createdAt: true,
          updatedAt: true,
          request: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
            },
          },
        },
      });

      return { data, page, limit, total };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy danh sách thông tin phê duyệt yêu cầu: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.requestApprovalInfo.findUnique({
        where: { id },
        select: {
          id: true,
          requestId: true,
          holdReason: true,
          denyReason: true,
          files: true,
          createdAt: true,
          updatedAt: true,
          request: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              customer: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException(
          `Không tìm thấy thông tin phê duyệt với ID ${id}`,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm thông tin phê duyệt: ${error.message}`);
    }
  }

  async create(dto: CreateRequestApprovalInfoDto) {
    try {
      const existingRequest = await this.prismaService.request.findUnique({
        where: { id: dto.requestId },
      });

      if (!existingRequest) {
        throw new NotFoundException(
          `Không tìm thấy yêu cầu với ID ${dto.requestId}`,
        );
      }

      const existingApprovalInfo =
        await this.prismaService.requestApprovalInfo.findFirst({
          where: { requestId: dto.requestId },
        });

      if (existingApprovalInfo) {
        throw new ConflictException(
          'Đã tồn tại thông tin phê duyệt cho yêu cầu này',
        );
      }

      const createData: any = {
        requestId: dto.requestId,
        holdReason: dto.holdReason,
        denyReason: dto.denyReason,
      };

      if (dto.files && dto.files.length > 0) {
        createData.files = dto.files;
      }

      const newApprovalInfo =
        await this.prismaService.requestApprovalInfo.create({
          data: createData,
          select: {
            id: true,
            requestId: true,
            holdReason: true,
            denyReason: true,
            files: true,
            createdAt: true,
            updatedAt: true,
            request: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        });

      return {
        message: 'Tạo thông tin phê duyệt thành công',
        data: newApprovalInfo,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi tạo thông tin phê duyệt: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateRequestApprovalInfoDto) {
    try {
      const existingApprovalInfo =
        await this.prismaService.requestApprovalInfo.findUnique({
          where: { id },
        });

      if (!existingApprovalInfo) {
        throw new NotFoundException(
          `Không tìm thấy thông tin phê duyệt với ID ${id}`,
        );
      }

      if (dto.requestId && dto.requestId !== existingApprovalInfo.requestId) {
        const newRequest = await this.prismaService.request.findUnique({
          where: { id: dto.requestId },
        });

        if (!newRequest) {
          throw new NotFoundException(
            `Không tìm thấy yêu cầu với ID ${dto.requestId}`,
          );
        }

        const existingApprovalForNewRequest =
          await this.prismaService.requestApprovalInfo.findFirst({
            where: {
              requestId: dto.requestId,
              id: { not: id },
            },
          });

        if (existingApprovalForNewRequest) {
          throw new ConflictException(
            'Đã tồn tại thông tin phê duyệt cho yêu cầu này',
          );
        }
      }

      const updateData: any = { ...dto };

      if (updateData.requestId) {
        delete updateData.requestId;
      }

      const updatedApprovalInfo =
        await this.prismaService.requestApprovalInfo.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            requestId: true,
            holdReason: true,
            denyReason: true,
            files: true,
            createdAt: true,
            updatedAt: true,
            request: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        });

      return {
        message: 'Cập nhật thông tin phê duyệt thành công',
        data: updatedApprovalInfo,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật thông tin phê duyệt: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const existingApprovalInfo =
        await this.prismaService.requestApprovalInfo.findUnique({
          where: { id },
        });

      if (!existingApprovalInfo) {
        throw new NotFoundException(
          `Không tìm thấy thông tin phê duyệt với ID ${id}`,
        );
      }

      await this.prismaService.requestApprovalInfo.delete({ where: { id } });

      return {
        message: 'Xóa thông tin phê duyệt thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi xóa thông tin phê duyệt: ${error.message}`);
    }
  }

  async findByRequestId(requestId: number) {
    try {
      const data = await this.prismaService.requestApprovalInfo.findFirst({
        where: { requestId },
        select: {
          id: true,
          requestId: true,
          holdReason: true,
          denyReason: true,
          files: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!data) {
        throw new NotFoundException(
          `Không tìm thấy thông tin phê duyệt cho yêu cầu ${requestId}`,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Lỗi khi tìm thông tin phê duyệt theo yêu cầu: ${error.message}`,
      );
    }
  }
}
