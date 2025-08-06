import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      if (filters?.materialId) where.materialId = filters.materialId;
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const total = await this.prismaService.fieldSubprocess.count({ where });
      const data = await this.prismaService.fieldSubprocess.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { id: 'desc' },
      });
      return { data, page, limit, total };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy danh sách fieldSubprocess: ${error.message}`,
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
          `Không tìm thấy fieldSubprocess với ID ${id}`,
        );
      }
      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm fieldSubprocess: ${error.message}`);
    }
  }

  async create(dto: CreateFieldSubprocessDto) {
    try {
      const newFieldSubprocess =
        await this.prismaService.fieldSubprocess.create({
          data: {
            materials: {
              connect: dto.materialIds.map((id) => ({ id })),
            },
          },
          include: { materials: true },
        });

      return {
        message: 'Tạo fieldSubprocess thành công',
        data: newFieldSubprocess,
      };
    } catch (error) {
      throw new Error(`Lỗi khi tạo fieldSubprocess: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateFieldSubprocessDto) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
        include: { materials: true },
      });

      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy fieldSubprocess với ID ${id}`,
        );
      }

      const currentMaterialIds = existing.materials.map((m) => m.id);
      const newMaterialIds = dto.materialIds || [];

      const toRemove = currentMaterialIds.filter(
        (id) => !newMaterialIds.includes(id),
      );
      const toAdd = newMaterialIds.filter(
        (id) => !currentMaterialIds.includes(id),
      );

      const updatedFieldSubprocess =
        await this.prismaService.fieldSubprocess.update({
          where: { id },
          data: {
            materials: {
              disconnect: toRemove.map((id) => ({ id })),
              connect: toAdd.map((id) => ({ id })),
            },
          },
          include: { materials: true },
        });

      return {
        message: 'Cập nhật fieldSubprocess thành công',
        data: updatedFieldSubprocess,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật fieldSubprocess: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Không tìm thấy fieldSubprocess với ID ${id}`,
        );
      }
      await this.prismaService.fieldSubprocess.delete({ where: { id } });
      return {
        message: 'Xóa fieldSubprocess thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi xóa fieldSubprocess: ${error.message}`);
    }
  }
}
