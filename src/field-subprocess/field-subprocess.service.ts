import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFieldSubprocessDto } from './dto/create-field-subprocess.dto';
import { UpdateFieldSubprocessDto } from './dto/update-field-subprocess.dto';
import { FilterFieldSubprocessDto } from './dto/filter-field-subprocess.dto';
import { MaterialService } from 'src/material/material.service';
import { CreateMaterialDto } from 'src/material/dto/create-material.dto';

@Injectable()
export class FieldSubprocessService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly materialService: MaterialService,
  ) {}

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
      throw new Error(`Lỗi khi lấy danh sách fieldSubprocess: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.fieldSubprocess.findUnique({ where: { id } });
      if (!data) {
        throw new NotFoundException(`Không tìm thấy fieldSubprocess với ID ${id}`);
      }
      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm fieldSubprocess: ${error.message}`);
    }
  }

  async create(dto: CreateFieldSubprocessDto & { material?: CreateMaterialDto }) {
    try {
      let materialId = dto.materialId;

      if (dto.material) {
        const materialRes = await this.materialService.create(dto.material);
        materialId = materialRes.data.id;
      }

      const existing = await this.prismaService.fieldSubprocess.findUnique({
        where: { materialId },
      });

      if (existing) {
        throw new ConflictException('MaterialId đã tồn tại trong fieldSubprocess');
      }

      const newItem = await this.prismaService.fieldSubprocess.create({ data: { materialId } });

      return {
        message: 'Tạo fieldSubprocess thành công',
        data: newItem,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Lỗi khi tạo fieldSubprocess: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateFieldSubprocessDto) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Không tìm thấy fieldSubprocess với ID ${id}`);
      }
      if (dto.materialId && dto.materialId !== existing.materialId) {
        const duplicated = await this.prismaService.fieldSubprocess.findUnique({
          where: { materialId: dto.materialId },
        });
        if (duplicated) {
          throw new ConflictException('MaterialId đã tồn tại trong fieldSubprocess');
        }
      }
      const updated = await this.prismaService.fieldSubprocess.update({ where: { id }, data: dto });
      return {
        message: 'Cập nhật fieldSubprocess thành công',
        data: updated,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật fieldSubprocess: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.prismaService.fieldSubprocess.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Không tìm thấy fieldSubprocess với ID ${id}`);
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
