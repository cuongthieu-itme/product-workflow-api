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

      if (filters.source) {
        whereCondition.source = filters.source;
      }

      if (filters.nameSource) {
        whereCondition.nameSource = {
          contains: filters.nameSource,
          mode: 'insensitive',
        };
      }

      if (filters.specificSource) {
        whereCondition.specificSource = {
          contains: filters.specificSource,
          mode: 'insensitive',
        };
      }

      if (filters.userId) {
        whereCondition.userId = filters.userId;
      }

      if (filters.statusProductId) {
        whereCondition.statusProductId = filters.statusProductId;
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
        image: true,
        source: true,
        nameSource: true,
        specificSource: true,
        userId: true,
        statusProductId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            color: true,
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
        image: true,
        source: true,
        nameSource: true,
        specificSource: true,
        userId: true,
        statusProductId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            color: true,
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
      where: { id: dto.userId },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${dto.userId}`,
      );
    }

    const statusProductExists =
      await this.prismaService.statusProduct.findUnique({
        where: { id: dto.statusProductId },
      });

    if (!statusProductExists) {
      throw new NotFoundException(
        `Không tìm thấy trạng thái sản phẩm với ID ${dto.statusProductId}`,
      );
    }

    const newRequest = await this.prismaService.request.create({
      data: {
        title: dto.title,
        description: dto.description,
        productLink: dto.productLink || [],
        image: dto.image || [],
        source: dto.source,
        nameSource: dto.nameSource,
        specificSource: dto.specificSource,
        userId: dto.userId,
        statusProductId: dto.statusProductId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        image: true,
        source: true,
        nameSource: true,
        specificSource: true,
        userId: true,
        statusProductId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            color: true,
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

    if (dto.userId && dto.userId !== existingRequest.userId) {
      const userExists = await this.prismaService.user.findUnique({
        where: { id: dto.userId },
      });

      if (!userExists) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${dto.userId}`,
        );
      }
    }

    if (
      dto.statusProductId &&
      dto.statusProductId !== existingRequest.statusProductId
    ) {
      const statusProductExists =
        await this.prismaService.statusProduct.findUnique({
          where: { id: dto.statusProductId },
        });

      if (!statusProductExists) {
        throw new NotFoundException(
          `Không tìm thấy trạng thái sản phẩm với ID ${dto.statusProductId}`,
        );
      }
    }

    const updatedRequest = await this.prismaService.request.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        title: true,
        description: true,
        productLink: true,
        image: true,
        source: true,
        nameSource: true,
        specificSource: true,
        userId: true,
        statusProductId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            color: true,
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
