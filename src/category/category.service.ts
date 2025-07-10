import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterCategoryDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.category.count({
      where: whereCondition,
    });

    const data = await this.prismaService.category.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateCategoryDto) {
    const existingCategory = await this.prismaService.category.findUnique({
      where: { name: dto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Tên danh mục đã tồn tại');
    }

    const newCategory = await this.prismaService.category.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo danh mục thành công',
      data: newCategory,
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existingCategory = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    if (dto.name && dto.name !== existingCategory.name) {
      const duplicatedName = await this.prismaService.category.findUnique({
        where: { name: dto.name },
      });

      if (duplicatedName) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }
    }

    const updatedCategory = await this.prismaService.category.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật danh mục thành công',
      data: updatedCategory,
    };
  }

  async remove(id: number) {
    const existingCategory = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    if (existingCategory._count.products > 0) {
      throw new ConflictException(
        'Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này',
      );
    }

    await this.prismaService.category.delete({ where: { id } });

    return {
      message: 'Xóa danh mục thành công',
    };
  }
}
