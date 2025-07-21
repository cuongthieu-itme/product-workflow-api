import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateNotificationAdminDto } from './dto/create-notification-admin.dto';
import { UpdateNotificationAdminDto } from './dto/update-notification-admin.dto';
import { FilterNotificationAdminDto } from './dto/filter-notification-admin.dto';

@Injectable()
export class NotificationAdminService {
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

    const total = await this.prismaService.notificationAdmin.count({ where });

    const data = await this.prismaService.notificationAdmin.findMany({
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
    const data = await this.prismaService.notificationAdmin.findUnique({
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
    const created = await this.prismaService.notificationAdmin.create({
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
    const existing = await this.prismaService.notificationAdmin.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
    }

    const updated = await this.prismaService.notificationAdmin.update({
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

  async remove(id: number) {
    const existing = await this.prismaService.notificationAdmin.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
    }

    await this.prismaService.notificationAdmin.delete({ where: { id } });

    return { message: 'Xóa thông báo thành công' };
  }
}
