import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateSourceOtherDto } from './dto/create-source-other.dto';
import { UpdateSourceOtherDto } from './dto/update-source-other.dto';
import { FilterSourceOtherDto } from './dto/filter-source-other.dto';

@Injectable()
export class SourceOtherService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterSourceOtherDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }
      if (filters.specifically) {
        whereCondition.specifically = {
          contains: filters.specifically,
          mode: 'insensitive',
        };
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.sourceOther.count({
      where: whereCondition,
    });

    const data = await this.prismaService.sourceOther.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        specifically: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.sourceOther.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        specifically: true,
        createdAt: true,
        updatedAt: true,
        requests: true,
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy nguồn khác với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateSourceOtherDto) {
    const existed = await this.prismaService.sourceOther.findFirst({
      where: { name: dto.name },
    });

    if (existed) {
      throw new ConflictException('Tên nguồn khác đã tồn tại');
    }

    const created = await this.prismaService.sourceOther.create({
      data: {
        name: dto.name,
        specifically: dto.specifically,
      },
      select: {
        id: true,
        name: true,
        specifically: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo nguồn khác thành công',
      data: created,
    };
  }

  async update(id: number, dto: UpdateSourceOtherDto) {
    const existed = await this.prismaService.sourceOther.findUnique({
      where: { id },
    });

    if (!existed) {
      throw new NotFoundException(`Không tìm thấy nguồn khác với ID ${id}`);
    }

    if (dto.name && dto.name !== existed.name) {
      const dup = await this.prismaService.sourceOther.findFirst({
        where: { name: dto.name },
      });
      if (dup) {
        throw new ConflictException('Tên nguồn khác đã tồn tại');
      }
    }

    const updated = await this.prismaService.sourceOther.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        specifically: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật nguồn khác thành công',
      data: updated,
    };
  }

  async remove(id: number) {
    const existed = await this.prismaService.sourceOther.findUnique({
      where: { id },
      include: {
        _count: { select: { requests: true } },
      },
    });

    if (!existed) {
      throw new NotFoundException(`Không tìm thấy nguồn khác với ID ${id}`);
    }

    if (existed._count.requests > 0) {
      throw new ConflictException(
        'Không thể xóa nguồn khác vì vẫn còn yêu cầu liên quan',
      );
    }

    await this.prismaService.sourceOther.delete({ where: { id } });
    return { message: 'Xóa nguồn khác thành công' };
  }
}
