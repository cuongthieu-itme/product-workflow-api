import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateMaterialRequestSubprocessHistoryDto,
  FilterMaterialRequestSubprocessHistoryDto,
  UpdateMaterialRequestSubprocessHistoryDto,
} from './dto/index';
import { CodeGenerationService } from 'src/common/code-generation/code-generation.service';

@Injectable()
export class MaterialRequestsSubprocessHistoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly codeGenerationService: CodeGenerationService,
  ) {}

  async findAll(filters?: FilterMaterialRequestSubprocessHistoryDto) {
    const where: any = {};

    if (filters) {
      if (filters.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
      }
      if (filters.code) {
        where.code = { contains: filters.code, mode: 'insensitive' };
      }
      if (filters.unit) {
        where.unit = { contains: filters.unit, mode: 'insensitive' };
      }
      if (typeof filters.isActive === 'boolean') {
        where.isActive = filters.isActive;
      }
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.originId) {
        where.originId = filters.originId;
      }
      if (filters.requestId) {
        where.requestId = filters.requestId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total =
      await this.prismaService.materialRequestSubprocessHistory.count({
        where,
      });

    const data =
      await this.prismaService.materialRequestSubprocessHistory.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: {
          origin: true,
          request: true,
        },
      });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data =
      await this.prismaService.materialRequestSubprocessHistory.findUnique({
        where: { id },
        include: { origin: true, request: true },
      });

    if (!data) {
      throw new NotFoundException(
        `Không tìm thấy material request subprocess history với ID ${id}`,
      );
    }

    return { data };
  }

  async create(dto: CreateMaterialRequestSubprocessHistoryDto) {
    let code = dto.code;
    if (!code) {
      // Reuse material-like code generation based on type
      const type = dto.type ?? 'INGREDIENT';
      code = await this.codeGenerationService.generateMaterialCode(type);
    }

    const existed =
      await this.prismaService.materialRequestSubprocessHistory.findUnique({
        where: { code },
      });
    if (existed) {
      throw new ConflictException('Mã đã tồn tại');
    }

    const created =
      await this.prismaService.materialRequestSubprocessHistory.create({
        data: { ...dto, code },
        include: { origin: true, request: true },
      });

    return { message: 'Tạo thành công', data: created };
  }

  async update(id: number, dto: UpdateMaterialRequestSubprocessHistoryDto) {
    const exist =
      await this.prismaService.materialRequestSubprocessHistory.findUnique({
        where: { id },
      });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy material request subprocess history với ID ${id}`,
      );
    }

    if (dto.code && dto.code !== exist.code) {
      const duplicated =
        await this.prismaService.materialRequestSubprocessHistory.findUnique({
          where: { code: dto.code },
        });
      if (duplicated) {
        throw new ConflictException('Mã đã tồn tại');
      }
    }

    const updated =
      await this.prismaService.materialRequestSubprocessHistory.update({
        where: { id },
        data: dto,
        include: { origin: true, request: true },
      });

    return { message: 'Cập nhật thành công', data: updated };
  }

  async remove(id: number) {
    const exist =
      await this.prismaService.materialRequestSubprocessHistory.findUnique({
        where: { id },
      });
    if (!exist) {
      throw new NotFoundException(
        `Không tìm thấy material request subprocess history với ID ${id}`,
      );
    }

    await this.prismaService.materialRequestSubprocessHistory.delete({
      where: { id },
    });
    return { message: 'Xóa thành công' };
  }
}
