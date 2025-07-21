import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateRequestInputDto } from './dto/create-request-input.dto';
import { UpdateRequestInputDto } from './dto/update-request-input.dto';
import { FilterRequestInputDto } from './dto/filter-request-input.dto';

@Injectable()
export class RequestInputService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterRequestInputDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.supplier) {
        whereCondition.supplier = {
          contains: filters.supplier,
          mode: 'insensitive',
        };
      }

      if (filters.sourceCountry) {
        whereCondition.sourceCountry = {
          contains: filters.sourceCountry,
          mode: 'insensitive',
        };
      }

      if (filters.materialId) {
        whereCondition.materialId = filters.materialId;
      }
    }

    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 100);

    const total = await this.prismaService.requestInput.count({
      where: whereCondition,
    });

    const data = await this.prismaService.requestInput.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        material: true,
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.requestInput.findUnique({
      where: { id },
      include: {
        material: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy yêu cầu nhập với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateRequestInputDto) {
    // validate material existence & uniqueness
    const material = await this.prismaService.material.findUnique({
      where: { id: dto.materialId },
      select: { id: true, isActive: true },
    });

    if (!material || !material.isActive) {
      throw new NotFoundException(
        `Không tìm thấy vật liệu hoạt động với ID ${dto.materialId}`,
      );
    }

    const existing = await this.prismaService.requestInput.findUnique({
      where: { materialId: dto.materialId },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Vật liệu với ID ${dto.materialId} đã có yêu cầu nhập`,
      );
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Số lượng phải lớn hơn 0');
    }
    if (dto.price < 0) {
      throw new BadRequestException('Giá không hợp lệ');
    }

    const newRequestInput = await this.prismaService.requestInput.create({
      data: {
        quantity: dto.quantity,
        expectedDate: dto.expectedDate,
        supplier: dto.supplier,
        sourceCountry: dto.sourceCountry,
        price: dto.price,
        reason: dto.reason,
        materialId: dto.materialId,
      },
      include: {
        material: true,
      },
    });

    return {
      message: 'Tạo yêu cầu nhập thành công',
      data: newRequestInput,
    };
  }

  async update(id: number, dto: UpdateRequestInputDto) {
    const existingRequest = await this.prismaService.requestInput.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu nhập với ID ${id}`);
    }

    if (dto.materialId && dto.materialId !== existingRequest.materialId) {
      const material = await this.prismaService.material.findUnique({
        where: { id: dto.materialId },
        select: { id: true, isActive: true },
      });

      if (!material || !material.isActive) {
        throw new NotFoundException(
          `Không tìm thấy vật liệu hoạt động với ID ${dto.materialId}`,
        );
      }

      const duplicated = await this.prismaService.requestInput.findUnique({
        where: { materialId: dto.materialId },
        select: { id: true },
      });
      if (duplicated && duplicated.id !== id) {
        throw new ConflictException(
          `Vật liệu với ID ${dto.materialId} đã có yêu cầu nhập`,
        );
      }
    }

    if (dto.quantity !== undefined && dto.quantity <= 0) {
      throw new BadRequestException('Số lượng phải lớn hơn 0');
    }
    if (dto.price !== undefined && dto.price < 0) {
      throw new BadRequestException('Giá không hợp lệ');
    }

    const updated = await this.prismaService.requestInput.update({
      where: { id },
      data: dto,
      include: { material: true },
    });

    return {
      message: 'Cập nhật yêu cầu nhập thành công',
      data: updated,
    };
  }

  async remove(id: number) {
    const existing = await this.prismaService.requestInput.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy yêu cầu nhập với ID ${id}`);
    }

    await this.prismaService.requestInput.delete({ where: { id } });

    return { message: 'Xóa yêu cầu nhập thành công' };
  }
}
