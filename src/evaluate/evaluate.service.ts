import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateEvaluateDto, UpdateEvaluateDto, FilterEvaluateDto } from './dto';

@Injectable()
export class EvaluateService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterEvaluateDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.title) {
        whereCondition.title = {
          contains: filters.title,
          mode: 'insensitive',
        };
      }
      if (filters.reviewType) {
        whereCondition.reviewType = {
          contains: filters.reviewType,
          mode: 'insensitive',
        };
      }
      if (filters.requestId) {
        whereCondition.requestId = filters.requestId;
      }
      if (filters.createdById) {
        whereCondition.createdById = filters.createdById;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.evaluate.count({
      where: whereCondition,
    });

    const data = await this.prismaService.evaluate.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.evaluate.findUnique({
      where: { id },
      include: {
        request: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateEvaluateDto) {
    const newEvaluate = await this.prismaService.evaluate.create({
      data: {
        title: dto.title,
        reviewType: dto.reviewType,
        score: dto.score,
        description: dto.description,
        isAnonymous: dto.isAnonymous,
        requestId: dto.requestId,
        createdById: dto.createdById,
      },
      include: {
        request: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Tạo đánh giá thành công',
      data: newEvaluate,
    };
  }

  async update(id: number, dto: UpdateEvaluateDto) {
    const existingEvaluate = await this.prismaService.evaluate.findUnique({
      where: { id },
    });

    if (!existingEvaluate) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    const updatedEvaluate = await this.prismaService.evaluate.update({
      where: { id },
      data: dto,
      include: {
        request: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật đánh giá thành công',
      data: updatedEvaluate,
    };
  }

  async remove(id: number) {
    const existingEvaluate = await this.prismaService.evaluate.findUnique({
      where: { id },
    });

    if (!existingEvaluate) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    await this.prismaService.evaluate.delete({ where: { id } });

    return {
      message: 'Xóa đánh giá thành công',
    };
  }
}
