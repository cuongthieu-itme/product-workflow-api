import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class RequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterRequestDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.title) {
        whereCondition.title = {
          contains: filters.title,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.sourceType) {
        whereCondition.sourceType = filters.sourceType;
      }

      if (filters.materialType) {
        whereCondition.materialType = filters.materialType;
      }

      if (filters.customerId) {
        whereCondition.customerId = filters.customerId;
      }

      if (filters.sourceOtherId) {
        whereCondition.sourceOtherId = filters.sourceOtherId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.request.count({
      where: whereCondition,
    });

    const data = await this.prismaService.request.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        sourceType: true,
        materialType: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.request.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        sourceType: true,
        materialType: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
        ingredients: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        accessories: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateRequestDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: { id: dto.customerId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${dto.customerId}`,
      );
    }

    const sourceOtherExists = await this.prismaService.sourceOther.findUnique({
      where: { id: dto.sourceOtherId },
    });

    if (!sourceOtherExists) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái sản phẩm với ID ${dto.sourceOtherId}`,
      );
    }

    const newRequest = await this.prismaService.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        productLink: dto.productLink || [],
        media: dto.media || [],
        sourceType: dto.sourceType,
        materialType: dto.materialType,
        customerId: dto.customerId,
        sourceOtherId: dto.sourceOtherId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        sourceType: true,
        materialType: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
      },
    });

    return {
      message: 'Tạo yêu cầu thành công',
      data: newRequest,
    };
  }

  async update(id: number, dto: UpdateRequestDto) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    if (dto.customerId && dto.customerId !== existingRequest.customerId) {
      const userExists = await this.prismaService.user.findUnique({
        where: { id: dto.customerId },
      });

      if (!userExists) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${dto.customerId}`,
        );
      }
    }

    if (
      dto.sourceOtherId &&
      dto.sourceOtherId !== existingRequest.sourceOtherId
    ) {
      const sourceOtherExists = await this.prismaService.sourceOther.findUnique(
        {
          where: { id: dto.sourceOtherId },
        },
      );

      if (!sourceOtherExists) {
        throw new NotFoundException(
          `Không tìm thấy trạng thái sản phẩm với ID ${dto.sourceOtherId}`,
        );
      }
    }

    const updatedRequest = await this.prismaService.request.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        productLink: dto.productLink,
        media: dto.media,
        sourceType: dto.sourceType,
        materialType: dto.materialType,
        customerId: dto.customerId,
        sourceOtherId: dto.sourceOtherId,
        ...(dto.ingredientIds && {
          ingredients: {
            set: dto.ingredientIds.map((id) => ({ id })),
          },
        }),
        ...(dto.accessoryIds && {
          accessories: {
            set: dto.accessoryIds.map((id) => ({ id })),
          },
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        media: true,
        sourceType: true,
        materialType: true,
        customerId: true,
        sourceOtherId: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật yêu cầu thành công',
      data: updatedRequest,
    };
  }

  async remove(id: number) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    await this.prismaService.request.delete({ where: { id } });

    return {
      message: 'Xóa yêu cầu thành công',
    };
  }
}
