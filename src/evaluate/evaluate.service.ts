import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateEvaluateDto, UpdateEvaluateDto, FilterEvaluateDto } from './dto';

@Injectable()
export class EvaluateService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterEvaluateDto) {
    try {
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
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách đánh giá: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm đánh giá: ${error.message}`);
    }
  }

  async create(dto: CreateEvaluateDto) {
    try {
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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Đánh giá đã tồn tại');
      }
      throw new Error(`Lỗi khi tạo đánh giá: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateEvaluateDto) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Đánh giá đã tồn tại');
      }
      throw new Error(`Lỗi khi cập nhật đánh giá: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi xóa đánh giá: ${error.message}`);
    }
  }
}
