import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { CreateOrUpdateProcedureDto } from './dto/create-or-update-procedure.dto';
import { FilterProcedureDto } from './dto/filter-procedure.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ProcedureService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterProcedureDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.procedure.count({
      where: whereCondition,
    });

    const data = await this.prismaService.procedure.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        subprocesses: {
          select: {
            id: true,
            name: true,
            description: true,
            estimatedNumberOfDays: true,
            numberOfDaysBeforeDeadline: true,
            roleOfThePersonInCharge: true,
            isRequired: true,
            isStepWithCost: true,
            step: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.procedure.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        subprocesses: {
          select: {
            id: true,
            name: true,
            description: true,
            estimatedNumberOfDays: true,
            numberOfDaysBeforeDeadline: true,
            roleOfThePersonInCharge: true,
            isRequired: true,
            isStepWithCost: true,
            step: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateProcedureDto) {
    const existingProcedure = await this.prismaService.procedure.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (existingProcedure) {
      throw new ConflictException(
        'Quy trình với tên và phiên bản này đã tồn tại',
      );
    }

    const newProcedure = await this.prismaService.procedure.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        subprocesses: {
          select: {
            id: true,
            name: true,
            description: true,
            estimatedNumberOfDays: true,
            numberOfDaysBeforeDeadline: true,
            roleOfThePersonInCharge: true,
            isRequired: true,
            isStepWithCost: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo quy trình thành công',
      data: newProcedure,
    };
  }

  async createOrUpdate(dto: CreateOrUpdateProcedureDto) {
    const { id, subprocesses = [], ...procedureData } = dto;

    if (id) {
      const existingProcedure = await this.prismaService.procedure.findUnique({
        where: { id },
      });
      if (!existingProcedure) {
        throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
      }

      const result = await this.prismaService.$transaction(async (tx) => {
        await tx.subprocess.deleteMany({ where: { procedureId: id } });

        const updatedProcedure = await tx.procedure.update({
          where: { id },
          data: {
            ...procedureData,
            version: { increment: 1 },
          },
        });

        if (subprocesses.length) {
          await tx.subprocess.createMany({
            data: subprocesses.map((sp) => ({
              ...sp,
              procedureId: id,
            })),
          });
        }

        return updatedProcedure;
      });

      return {
        message: 'Cập nhật quy trình thành công',
        data: await this.findOne(result.id),
      };
    }

    const duplicated = await this.prismaService.procedure.findFirst({
      where: { name: procedureData.name },
    });
    if (duplicated) {
      throw new ConflictException('Quy trình với tên này đã tồn tại');
    }

    const newProcedure = await this.prismaService.$transaction(async (tx) => {
      const created = await tx.procedure.create({
        data: procedureData,
      });

      if (subprocesses.length) {
        await tx.subprocess.createMany({
          data: subprocesses.map((sp) => ({
            ...sp,
            procedureId: created.id,
          })),
        });
      }

      return created;
    });

    return {
      message: 'Tạo quy trình thành công',
      data: await this.findOne(newProcedure.id),
    };
  }

  async update(id: number, dto: UpdateProcedureDto) {
    const existingProcedure = await this.prismaService.procedure.findUnique({
      where: { id },
    });

    if (!existingProcedure) {
      throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
    }

    if (dto.name) {
      const duplicatedProcedure = await this.prismaService.procedure.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (duplicatedProcedure) {
        throw new ConflictException(
          'Quy trình với tên và phiên bản này đã tồn tại',
        );
      }
    }

    const updatedProcedure = await this.prismaService.procedure.update({
      where: { id },
      data: {
        ...dto,
        version: {
          increment: 1,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        subprocesses: {
          select: {
            id: true,
            name: true,
            description: true,
            estimatedNumberOfDays: true,
            numberOfDaysBeforeDeadline: true,
            roleOfThePersonInCharge: true,
            isRequired: true,
            isStepWithCost: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật quy trình thành công',
      data: updatedProcedure,
    };
  }

  async remove(id: number) {
    const existingProcedure = await this.prismaService.procedure.findUnique({
      where: { id },
    });

    if (!existingProcedure) {
      throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
    }

    await this.prismaService.procedure.delete({ where: { id } });

    return {
      message: 'Xóa quy trình thành công',
    };
  }
}
