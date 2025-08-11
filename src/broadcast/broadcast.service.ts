import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateNotificationAdminDto } from './dto/create-broadcast.dto';
import { UpdateNotificationAdminDto } from './dto/update-broadcast.dto';
import { FilterNotificationAdminDto } from './dto/filter-broadcast.dto';

@Injectable()
export class BroadcastService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterNotificationAdminDto) {
    const where: any = {};

    if (filters) {
      if (filters.title) {
        where.title = { contains: filters.title, mode: 'insensitive' };
      }
      if (filters.content) {
        where.content = { contains: filters.content, mode: 'insensitive' };
      }
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.isRead !== undefined) {
        where.isRead = filters.isRead;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.broadcast.count({ where });

    const data = await this.prismaService.broadcast.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.broadcast.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateNotificationAdminDto) {
    const created = await this.prismaService.broadcast.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo thông báo thành công',
      data: created,
    };
  }

  async update(id: number, dto: UpdateNotificationAdminDto) {
    const existing = await this.prismaService.broadcast.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
    }

    const updated = await this.prismaService.broadcast.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật thông báo thành công',
      data: updated,
    };
  }

  async updateIsRead(
    ids: number[],
  ): Promise<{ message: string; count?: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { message: 'Danh sách ID thông báo trống' };
    }

    try {
      const result = await this.prismaService.broadcast.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });

      return {
        message: 'Cập nhật trạng thái xem thông báo thành công',
        count: result.count,
      };
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái isRead:', error);

      return { message: 'Đã xảy ra lỗi khi cập nhật trạng thái thông báo' };
    }
  }

  async remove(id: number) {
    const existing = await this.prismaService.broadcast.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
    }

    await this.prismaService.broadcast.delete({ where: { id } });

    return { message: 'Xóa thông báo thành công' };
  }
}
