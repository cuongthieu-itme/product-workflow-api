import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOriginDto } from './dto/create-origin.dto';
import { UpdateOriginDto } from './dto/update-origin.dto';
import { FilterOriginDto } from './dto/filter-origin.dto';

@Injectable()
export class OriginService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterOriginDto) {
    try {
      const whereCondition: any = {};

      if (filters?.name) {
        whereCondition.name = { contains: filters.name, mode: 'insensitive' };
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const total = await this.prismaService.origin.count({
        where: whereCondition,
      });

      const data = await this.prismaService.origin.findMany({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { materials: true } },
        },
      });

      return { data, page, limit, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.origin.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          materials: true,
          _count: { select: { materials: true } },
        },
      });

      if (!data)
        throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

      return { data };
    } catch (error) {
      throw error;
    }
  }

  async create(dto: CreateOriginDto) {
    try {
      const exists = await this.prismaService.origin.findUnique({
        where: { name: dto.name },
      });
      if (exists) throw new ConflictException('Tên xuất xứ đã tồn tại');

      const created = await this.prismaService.origin.create({
        data: { name: dto.name },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      });

      return { message: 'Tạo xuất xứ thành công', data: created };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, dto: UpdateOriginDto) {
    try {
      const existing = await this.prismaService.origin.findUnique({
        where: { id },
      });
      if (!existing)
        throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

      if (dto.name && dto.name !== existing.name) {
        const dup = await this.prismaService.origin.findUnique({
          where: { name: dto.name },
        });
        if (dup) throw new ConflictException('Tên xuất xứ đã tồn tại');
      }

      const updated = await this.prismaService.origin.update({
        where: { id },
        data: dto,
      });

      return { message: 'Cập nhật xuất xứ thành công', data: updated };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.origin.findUnique({
        where: { id },
        include: { _count: { select: { materials: true } } },
      });

      if (!existing)
        throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

      if (existing._count.materials > 0) {
        throw new ConflictException(
          'Không thể xóa xuất xứ vì vẫn còn vật liệu thuộc xuất xứ này',
        );
      }

      await this.prismaService.origin.delete({ where: { id } });
      return { message: 'Xóa xuất xứ thành công' };
    } catch (error) {
      throw error;
    }
  }
}
