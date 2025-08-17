import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterProductDto) {
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

      if (filters.categoryId) {
        whereCondition.categoryId = filters.categoryId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.product.count({
      where: whereCondition,
    });

    const data = await this.prismaService.product.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        manufacturingProcess: true,
        categoryId: true,
        requestId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        manufacturingProcess: true,
        categoryId: true,
        requestId: true,
        productMaterials: {
          select: {
            id: true,
            materialId: true,
            quantity: true,
            material: {
              select: {
                id: true,
                name: true,
                unit: true,
                description: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateProductDto) {
    // Kiểm tra category tồn tại
    const category = await this.prismaService.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Không tìm thấy danh mục với ID ${dto.categoryId}`,
      );
    }

    // Kiểm tra request tồn tại nếu có requestId
    if (dto.requestId) {
      const request = await this.prismaService.request.findUnique({
        where: { id: dto.requestId },
      });

      if (!request) {
        throw new NotFoundException(
          `Không tìm thấy yêu cầu với ID ${dto.requestId}`,
        );
      }
    }

    const newProduct = await this.prismaService.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        categoryId: dto.categoryId,
        manufacturingProcess: dto.manufacturingProcess,
        requestId: dto.requestId,
        productMaterials: {
          create: dto.productMaterials?.map((material) => ({
            materialId: material.materialId,
            quantity: material.quantity,
          })),
        },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        manufacturingProcess: true,
        categoryId: true,
        requestId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo sản phẩm thành công',
      data: newProduct,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
    }

    // Kiểm tra category tồn tại nếu có thay đổi categoryId
    if (dto.categoryId && dto.categoryId !== existingProduct.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Không tìm thấy danh mục với ID ${dto.categoryId}`,
        );
      }
    }

    // Kiểm tra request tồn tại nếu có thay đổi requestId
    if (dto.requestId && dto.requestId !== existingProduct.requestId) {
      const request = await this.prismaService.request.findUnique({
        where: { id: dto.requestId },
      });

      if (!request) {
        throw new NotFoundException(
          `Không tìm thấy yêu cầu với ID ${dto.requestId}`,
        );
      }
    }

    const updatedProduct = await this.prismaService.product.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        manufacturingProcess: dto.manufacturingProcess,
        categoryId: dto.categoryId,
        requestId: dto.requestId,
        productMaterials: {
          deleteMany: {}, // Xóa tất cả nguyên liệu cũ
          create: dto.productMaterials?.map((material) => ({
            materialId: material.materialId,
            quantity: material.quantity,
          })),
        },
      },

      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        manufacturingProcess: true,
        categoryId: true,
        requestId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct,
    };
  }

  async remove(id: number) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
    }

    await this.prismaService.product.delete({ where: { id } });

    return {
      message: 'Xóa sản phẩm thành công',
    };
  }
}
