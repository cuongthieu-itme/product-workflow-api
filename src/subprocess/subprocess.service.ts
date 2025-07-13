import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubprocessDto } from './dto/create-subprocess.dto';
import { UpdateSubprocessDto } from './dto/update-subprocess.dto';
import { FilterSubprocessDto } from './dto/filter-subprocess.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SubprocessService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterSubprocessDto) {
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

      if (filters.roleOfThePersonInCharge) {
        whereCondition.roleOfThePersonInCharge = {
          contains: filters.roleOfThePersonInCharge,
          mode: 'insensitive',
        };
      }

      if (filters.isRequired !== undefined) {
        whereCondition.isRequired = filters.isRequired;
      }

      if (filters.isStepWithCost !== undefined) {
        whereCondition.isStepWithCost = filters.isStepWithCost;
      }

      if (filters.procedureId) {
        whereCondition.procedureId = filters.procedureId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.subprocess.count({
      where: whereCondition,
    });

    const data = await this.prismaService.subprocess.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        estimatedNumberOfDays: true,
        numberOfDaysBeforeDeadline: true,
        roleOfThePersonInCharge: true,
        isRequired: true,
        isStepWithCost: true,
        procedureId: true,
        step: true,
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.subprocess.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        estimatedNumberOfDays: true,
        numberOfDaysBeforeDeadline: true,
        roleOfThePersonInCharge: true,
        isRequired: true,
        isStepWithCost: true,
        procedureId: true,
        step: true,
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy quy trình con với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateSubprocessDto) {
    const existingProcedure = await this.prismaService.procedure.findUnique({
      where: { id: dto.procedureId },
    });

    if (!existingProcedure) {
      throw new NotFoundException(
        `Không tìm thấy quy trình con với ID ${dto.procedureId}`,
      );
    }

    const existingSubprocess = await this.prismaService.subprocess.findFirst({
      where: {
        name: dto.name,
        procedureId: dto.procedureId,
      },
    });

    if (existingSubprocess) {
      throw new ConflictException(
        'Tên quy trình con đã tồn tại trong procedure này',
      );
    }

    const newSubprocess = await this.prismaService.subprocess.create({
      data: {
        name: dto.name,
        description: dto.description,
        estimatedNumberOfDays: dto.estimatedNumberOfDays,
        numberOfDaysBeforeDeadline: dto.numberOfDaysBeforeDeadline,
        roleOfThePersonInCharge: dto.roleOfThePersonInCharge,
        isRequired: dto.isRequired || false,
        isStepWithCost: dto.isStepWithCost || false,
        procedureId: dto.procedureId,
        step: dto.step,
      },
      select: {
        id: true,
        name: true,
        description: true,
        estimatedNumberOfDays: true,
        numberOfDaysBeforeDeadline: true,
        roleOfThePersonInCharge: true,
        isRequired: true,
        isStepWithCost: true,
        procedureId: true,
        step: true,
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo quy trình con thành công',
      data: newSubprocess,
    };
  }

  async update(id: number, dto: UpdateSubprocessDto) {
    const existingSubprocess = await this.prismaService.subprocess.findUnique({
      where: { id },
    });

    if (!existingSubprocess) {
      throw new NotFoundException(`Không tìm thấy quy trình con với ID ${id}`);
    }

    if (dto.procedureId) {
      const existingProcedure = await this.prismaService.procedure.findUnique({
        where: { id: dto.procedureId },
      });

      if (!existingProcedure) {
        throw new NotFoundException(
          `Không tìm thấy quy trình với ID ${dto.procedureId}`,
        );
      }
    }

    if (dto.name && dto.name !== existingSubprocess.name) {
      const duplicatedName = await this.prismaService.subprocess.findFirst({
        where: {
          name: dto.name,
          procedureId: dto.procedureId || existingSubprocess.procedureId,
          NOT: { id: id },
        },
      });

      if (duplicatedName) {
        throw new ConflictException(
          'Tên quy trình con đã tồn tại trong quy trình này',
        );
      }
    }

    const updatedSubprocess = await this.prismaService.subprocess.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        estimatedNumberOfDays: true,
        numberOfDaysBeforeDeadline: true,
        roleOfThePersonInCharge: true,
        isRequired: true,
        isStepWithCost: true,
        procedureId: true,
        step: true,
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật quy trình con thành công',
      data: updatedSubprocess,
    };
  }

  async remove(id: number) {
    const existingSubprocess = await this.prismaService.subprocess.findUnique({
      where: { id },
    });

    if (!existingSubprocess) {
      throw new NotFoundException(`Không tìm thấy quy trình con với ID ${id}`);
    }

    await this.prismaService.subprocess.delete({ where: { id } });

    return {
      message: 'Xóa quy trình con thành công',
    };
  }
}
