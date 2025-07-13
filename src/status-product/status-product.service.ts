import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStatusProductDTO } from './dto/create-status-product.dto';
import { UpdateStatusProductDto } from './dto/update-status-product.dto';
import { FilterStatusProductDTO } from './dto/filter-status-product.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StatusProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterStatusProductDTO) {
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

      if (filters.color) {
        whereCondition.color = {
          contains: filters.color,
          mode: 'insensitive',
        };
      }

      if (filters.procedureId) {
        whereCondition.procedureId = filters.procedureId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.statusProduct.count({
      where: whereCondition,
    });

    const data = await this.prismaService.statusProduct.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        procedureId: true,
        createdAt: true,
        updatedAt: true,
        procedure: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.statusProduct.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        procedureId: true,
        createdAt: true,
        updatedAt: true,
        procedure: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái sản phẩm với ID ${id}`,
      );
    }

    return { data };
  }

  async create(dto: CreateStatusProductDTO) {
    const existingStatusProduct =
      await this.prismaService.statusProduct.findUnique({
        where: { name: dto.name },
      });

    if (existingStatusProduct) {
      throw new ConflictException('Tên trạng thái sản phẩm đã tồn tại');
    }

    const newStatusProduct = await this.prismaService.statusProduct.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        procedureId: dto.procedureId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        procedureId: true,
        createdAt: true,
        updatedAt: true,
        procedure: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Tạo trạng thái sản phẩm thành công',
      data: newStatusProduct,
    };
  }

  async update(id: number, dto: UpdateStatusProductDto) {
    const existingStatusProduct =
      await this.prismaService.statusProduct.findUnique({
        where: { id },
      });

    if (!existingStatusProduct) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái sản phẩm với ID ${id}`,
      );
    }

    if (dto.name && dto.name !== existingStatusProduct.name) {
      const duplicatedName = await this.prismaService.statusProduct.findUnique({
        where: { name: dto.name },
      });

      if (duplicatedName) {
        throw new ConflictException('Tên trạng thái sản phẩm đã tồn tại');
      }
    }

    const updatedStatusProduct = await this.prismaService.statusProduct.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        procedureId: true,
        createdAt: true,
        updatedAt: true,
        procedure: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật trạng thái sản phẩm thành công',
      data: updatedStatusProduct,
    };
  }

  async remove(id: number) {
    const existingStatusProduct =
      await this.prismaService.statusProduct.findUnique({
        where: { id },
      });

    if (!existingStatusProduct) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái sản phẩm với ID ${id}`,
      );
    }

    await this.prismaService.statusProduct.delete({ where: { id } });

    return {
      message: 'Xóa trạng thái sản phẩm thành công',
    };
  }
}
