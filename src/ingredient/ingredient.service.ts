import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  FilterIngredientDto,
} from './dto';
import { ORIGIN_OPTIONS, UNIT_OPTIONS } from './constants';

@Injectable()
export class IngredientService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterIngredientDto) {
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

      if (filters.unit) {
        whereCondition.unit = {
          contains: filters.unit,
          mode: 'insensitive',
        };
      }

      if (filters.origin) {
        whereCondition.origin = {
          contains: filters.origin,
          mode: 'insensitive',
        };
      }

      if (filters.isActive !== undefined) {
        whereCondition.isActive = filters.isActive;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.ingredient.count({
      where: whereCondition,
    });

    const data = await this.prismaService.ingredient.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        origin: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.ingredient.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        origin: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateIngredientDto) {
    // Kiểm tra mã nguyên liệu đã tồn tại chưa
    const existingIngredient = await this.prismaService.ingredient.findFirst({
      where: { code: dto.code },
    });

    if (existingIngredient) {
      throw new NotFoundException(`Mã nguyên liệu "${dto.code}" đã tồn tại`);
    }

    const newIngredient = await this.prismaService.ingredient.create({
      data: {
        name: dto.name,
        code: dto.code,
        quantity: dto.quantity,
        unit: dto.unit,
        origin: dto.origin,
        description: dto.description,
        image: dto.image || [],
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        origin: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo nguyên liệu thành công',
      data: newIngredient,
    };
  }

  async update(id: number, dto: UpdateIngredientDto) {
    const existingIngredient = await this.prismaService.ingredient.findUnique({
      where: { id },
    });

    if (!existingIngredient) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu với ID ${id}`);
    }

    // Kiểm tra mã nguyên liệu đã tồn tại chưa (nếu có thay đổi code)
    if (dto.code && dto.code !== existingIngredient.code) {
      const duplicateCodeIngredient =
        await this.prismaService.ingredient.findFirst({
          where: {
            code: dto.code,
            id: { not: id },
          },
        });

      if (duplicateCodeIngredient) {
        throw new NotFoundException(`Mã nguyên liệu "${dto.code}" đã tồn tại`);
      }
    }

    const updatedIngredient = await this.prismaService.ingredient.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        origin: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật nguyên liệu thành công',
      data: updatedIngredient,
    };
  }

  async remove(id: number) {
    const existingIngredient = await this.prismaService.ingredient.findUnique({
      where: { id },
    });

    if (!existingIngredient) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu với ID ${id}`);
    }

    await this.prismaService.ingredient.delete({ where: { id } });

    return {
      message: 'Xóa nguyên liệu thành công',
    };
  }

  async getOptionUnits() {
    return {
      data: UNIT_OPTIONS.map((unit) => ({ value: unit.id, label: unit.name })),
    };
  }

  async getOptionOrigins() {
    return {
      data: ORIGIN_OPTIONS.map((origin) => ({
        value: origin.id,
        label: origin.name,
      })),
    };
  }
}
