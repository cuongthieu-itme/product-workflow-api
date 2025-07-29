import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSubprocessHistoryDto } from './dto/create-subprocess-history.dto';
import { FilterSubprocessHistoryDto, UpdateSubprocessHistoryDto } from './dto';
import { UpdateSubprocessHistoryStatusDto } from './dto/update-subprocess-history-status.dto';
import { UpdateSubprocessHistoryIsApprovedDto } from './dto/update-subprocess-history-is-approved.dto';

@Injectable()
export class SubprocessesHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterSubprocessHistoryDto) {
    const where: any = {};

    if (filters) {
      if (filters.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.procedureHistoryId) {
        where.procedureHistoryId = filters.procedureHistoryId;
      }
      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }
      if (filters.userId) {
        where.userId = filters.userId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.subprocessHistory.count({ where });

    const data = await this.prismaService.subprocessHistory.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        procedureHistory: true,
        department: true,
        user: {
          select: { id: true, fullName: true },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
      include: {
        procedureHistory: true,
        department: true,
        user: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Không tìm thấy subprocess history với ID ${id}`,
      );
    }

    return { data };
  }

  async create(dto: CreateSubprocessHistoryDto) {
    const newItem = await this.prismaService.subprocessHistory.create({
      data: { ...dto },
      include: {
        procedureHistory: true,
        department: true,
        user: { select: { id: true, fullName: true } },
      },
    });

    return { message: 'Tạo subprocess history thành công', data: newItem };
  }

  async update(id: number, dto: UpdateSubprocessHistoryDto) {
    const exist = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy subprocess history với ID ${id}`,
      );
    }

    const updated = await this.prismaService.subprocessHistory.update({
      where: { id },
      data: dto,
      include: {
        procedureHistory: true,
        department: true,
        user: { select: { id: true, fullName: true } },
      },
    });

    return { message: 'Cập nhật subprocess history thành công', data: updated };
  }

  async updateStatus(id: number, dto: UpdateSubprocessHistoryStatusDto) {
    const exist = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy subprocess history với ID ${id}`,
      );
    }

    const updated = await this.prismaService.subprocessHistory.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      message: 'Cập nhật trạng thái subprocess history thành công',
      data: updated,
    };
  }

  async remove(id: number) {
    const exist = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy subprocess history với ID ${id}`,
      );
    }

    await this.prismaService.subprocessHistory.delete({ where: { id } });
    return { message: 'Xóa subprocess history thành công' };
  }

  async updateIsApproved(
    id: number,
    dto: UpdateSubprocessHistoryIsApprovedDto,
  ) {
    const exist = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy subprocess history với ID ${id}`,
      );
    }

    const updated = await this.prismaService.subprocessHistory.update({
      where: { id },
      data: { isApproved: dto.isApproved },
    });

    return {
      message: 'Cập nhật trạng thái subprocess history thành công',
      data: updated,
    };
  }
}
