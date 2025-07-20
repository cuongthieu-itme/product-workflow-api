import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto';
import { FilterMaterialDto } from './dto';

@Injectable()
export class MaterialService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterMaterialDto) {
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
      if (filters.type) {
        whereCondition.type = filters.type;
      }
      if (filters.originId) {
        whereCondition.originId = +filters.originId;
      }
      if (typeof filters.isActive === 'boolean') {
        whereCondition.isActive = filters.isActive;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.material.count({
      where: whereCondition,
    });

    const data = await this.prismaService.material.findMany({
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
        description: true,
        image: true,
        isActive: true,
        type: true,
        origin: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            requestMaterials: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.material.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        description: true,
        image: true,
        isActive: true,
        type: true,
        origin: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        requestMaterials: {
          select: {
            id: true,
            requestId: true,
          },
        },
        _count: {
          select: {
            requestMaterials: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy vật liệu với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateMaterialDto) {
    const existingCode = await this.prismaService.material.findUnique({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException('Mã vật liệu đã tồn tại');
    }

    const newMaterial = await this.prismaService.material.create({
      data: {
        name: dto.name,
        code: dto.code,
        quantity: dto.quantity,
        unit: dto.unit,
        description: dto.description,
        image: dto.image,
        isActive: dto.isActive ?? true,
        type: dto.type,
        originId: dto.originId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        description: true,
        image: true,
        isActive: true,
        type: true,
        originId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo vật liệu thành công',
      data: newMaterial,
    };
  }

  async update(id: number, dto: UpdateMaterialDto) {
    const existingMaterial = await this.prismaService.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      throw new NotFoundException(`Không tìm thấy vật liệu với ID ${id}`);
    }

    if (dto.code && dto.code !== existingMaterial.code) {
      const duplicatedCode = await this.prismaService.material.findUnique({
        where: { code: dto.code },
      });
      if (duplicatedCode) {
        throw new ConflictException('Mã vật liệu đã tồn tại');
      }
    }

    const updatedMaterial = await this.prismaService.material.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        quantity: true,
        unit: true,
        description: true,
        image: true,
        isActive: true,
        type: true,
        originId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật vật liệu thành công',
      data: updatedMaterial,
    };
  }

  async remove(id: number) {
    const existingMaterial = await this.prismaService.material.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            requestMaterials: true,
          },
        },
      },
    });

    if (!existingMaterial) {
      throw new NotFoundException(`Không tìm thấy vật liệu với ID ${id}`);
    }

    if (existingMaterial._count.requestMaterials > 0) {
      throw new ConflictException(
        'Không thể xóa vật liệu vì vẫn còn được sử dụng trong yêu cầu',
      );
    }

    await this.prismaService.material.delete({ where: { id } });

    return { message: 'Xóa vật liệu thành công' };
  }
}
