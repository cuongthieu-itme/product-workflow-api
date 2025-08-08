import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFieldSubprocessDto } from './dto/create-field-subprocess.dto';
import { UpdateFieldSubprocessDto } from './dto/update-field-subprocess.dto';
import { FilterFieldSubprocessDto } from './dto/filter-field-subprocess.dto';

@Injectable()
export class FieldSubprocessService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterFieldSubprocessDto) {
    try {
      const where: any = {};
      if (filters?.subprocessId) where.subprocessId = filters.subprocessId;

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const [total, data] = await Promise.all([
        this.prismaService.fieldSubprocess.count({ where }),
        this.prismaService.fieldSubprocess.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { id: 'desc' },
        }),
      ]);

      return { data, page, limit, total };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy danh sách các trường tiến trình: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Lỗi khi tìm các trường tiến trình: ${error.message}`);
    }
  }

  async create(dto: CreateFieldSubprocessDto) {
    try {
      const newFieldSubprocess =
        await this.prismaService.fieldSubprocess.create({
          data: { subprocessId: dto.subprocessId },
          include: { subprocess: true },
        });

      return {
        message: 'Tạo các trường tiến trình thành công',
        data: newFieldSubprocess,
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo các trường tiến trình: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateFieldSubprocessDto) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      const updateData: any = {};
      if (dto.subprocessId !== undefined)
        updateData.subprocessId = dto.subprocessId;

      const updatedFieldSubprocess =
        await this.prismaService.fieldSubprocess.update({
          where: { id },
          data: updateData,
          include: { subprocess: true },
        });

      return {
        message: 'Cập nhật các trường tiến trình thành công',
        data: updatedFieldSubprocess,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(
        `Lỗi khi cập nhật các trường tiến trình: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy các trường tiến trình với ID ${id}`,
        );
      }

      await this.prismaService.fieldSubprocess.delete({ where: { id } });

      return { message: 'Xóa các trường tiến trình thành công' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Lỗi khi xóa các trường tiến trình: ${error.message}`);
    }
  }
}
