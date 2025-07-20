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
    const whereCondition: any = {};

    if (filters?.name) {
      whereCondition.name = { contains: filters.name, mode: 'insensitive' };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.origin.count({ where: whereCondition });

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
  }

  async findOne(id: number) {
    const data = await this.prismaService.origin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        materials: {
          select: {
            id: true,
            name: true,
            code: true,
            quantity: true,
            unit: true,
            type: true,
            createdAt: true,
          },
        },
        _count: { select: { materials: true } },
      },
    });

    if (!data) throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

    return { data };
  }

  async create(dto: CreateOriginDto) {
    const exists = await this.prismaService.origin.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Tên xuất xứ đã tồn tại');

    const created = await this.prismaService.origin.create({
      data: { name: dto.name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });

    return { message: 'Tạo xuất xứ thành công', data: created };
  }

  async update(id: number, dto: UpdateOriginDto) {
    const existing = await this.prismaService.origin.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prismaService.origin.findUnique({ where: { name: dto.name } });
      if (dup) throw new ConflictException('Tên xuất xứ đã tồn tại');
    }

    const updated = await this.prismaService.origin.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });

    return { message: 'Cập nhật xuất xứ thành công', data: updated };
  }

  async remove(id: number) {
    const existing = await this.prismaService.origin.findUnique({
      where: { id },
      include: { _count: { select: { materials: true } } },
    });

    if (!existing) throw new NotFoundException(`Không tìm thấy xuất xứ với ID ${id}`);

    if (existing._count.materials > 0) {
      throw new ConflictException('Không thể xóa xuất xứ vì vẫn còn vật liệu thuộc xuất xứ này');
    }

    await this.prismaService.origin.delete({ where: { id } });
    return { message: 'Xóa xuất xứ thành công' };
  }
}

