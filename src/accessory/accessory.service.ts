import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateAccessoryDto,
  UpdateAccessoryDto,
  FilterAccessoryDto,
} from './dto';

@Injectable()
export class AccessoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterAccessoryDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.code) {
        whereCondition.code = {
          contains: filters.code,
          mode: 'insensitive',
        };
      }

      if (filters.isActive !== undefined) {
        whereCondition.isActive = filters.isActive;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.accessory.count({
      where: whereCondition,
    });

    const data = await this.prismaService.accessory.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        image: true,
        quantity: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.accessory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        image: true,
        quantity: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy phụ kiện với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateAccessoryDto) {
    // Kiểm tra mã phụ kiện đã tồn tại chưa
    const existingAccessory = await this.prismaService.accessory.findFirst({
      where: { code: dto.code },
    });

    if (existingAccessory) {
      throw new NotFoundException(`Mã phụ kiện "${dto.code}" đã tồn tại`);
    }

    const newAccessory = await this.prismaService.accessory.create({
      data: {
        name: dto.name,
        code: dto.code,
        quantity: dto.quantity,
        description: dto.description,
        image: dto.image || [],
        isActive: dto.isActive,
      },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo phụ kiện thành công',
      data: newAccessory,
    };
  }

  async update(id: number, dto: UpdateAccessoryDto) {
    const existingAccessory = await this.prismaService.accessory.findUnique({
      where: { id },
    });

    if (!existingAccessory) {
      throw new NotFoundException(`Không tìm thấy phụ kiện với ID ${id}`);
    }

    // Kiểm tra mã phụ kiện đã tồn tại chưa (nếu có thay đổi code)
    if (dto.code && dto.code !== existingAccessory.code) {
      const duplicateCodeAccessory =
        await this.prismaService.accessory.findFirst({
          where: {
            code: dto.code,
            id: { not: id },
          },
        });

      if (duplicateCodeAccessory) {
        throw new NotFoundException(`Mã phụ kiện "${dto.code}" đã tồn tại`);
      }
    }

    const updatedAccessory = await this.prismaService.accessory.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật phụ kiện thành công',
      data: updatedAccessory,
    };
  }

  async remove(id: number) {
    const existingAccessory = await this.prismaService.accessory.findUnique({
      where: { id },
    });

    if (!existingAccessory) {
      throw new NotFoundException(`Không tìm thấy phụ kiện với ID ${id}`);
    }

    await this.prismaService.accessory.delete({ where: { id } });

    return {
      message: 'Xóa phụ kiện thành công',
    };
  }
}
