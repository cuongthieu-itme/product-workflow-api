import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubprocessDto } from './dto/create-subprocess.dto';
import { UpdateSubprocessDto } from './dto/update-subprocess.dto';
import { FilterSubprocessDto } from './dto/filter-subprocess.dto';
import { ReorderStepsDto } from './dto/reorder-steps.dto';
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

      if (filters.departmentId) {
        whereCondition.departmentId = filters.departmentId;
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
        department: {
          select: {
            id: true,
            name: true,
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
        department: {
          select: {
            id: true,
            name: true,
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
    // Validate procedure existence
    await this.validateProcedureExists(dto.procedureId);

    // Validate uniqueness constraints
    await this.validateSubprocessUniqueness(dto);

    // Create subprocess and history in transaction
    return await this.prismaService.$transaction(async (prisma) => {
      const subprocessData = this.buildSubprocessData(dto);

      const newSubprocess = await prisma.subprocess.create({
        data: subprocessData,
        select: this.getSubprocessSelectFields(),
      });

      return {
        message: 'Tạo quy trình con thành công',
        data: newSubprocess,
      };
    });
  }

  private async validateProcedureExists(procedureId: number): Promise<void> {
    const existingProcedure = await this.prismaService.procedure.findUnique({
      where: { id: procedureId },
    });

    if (!existingProcedure) {
      throw new NotFoundException(
        `Không tìm thấy quy trình con với ID ${procedureId}`,
      );
    }
  }

  private async validateSubprocessUniqueness(
    dto: CreateSubprocessDto,
  ): Promise<void> {
    const whereClause = {
      procedureId: dto.procedureId,
      departmentId: dto.departmentId,
    };

    // Check for duplicate name
    const existingSubprocess = await this.prismaService.subprocess.findFirst({
      where: {
        ...whereClause,
        name: dto.name,
      },
    });

    if (existingSubprocess) {
      throw new ConflictException(
        'Tên quy trình con đã tồn tại trong procedure này',
      );
    }

    // Check for duplicate step
    const duplicatedStep = await this.prismaService.subprocess.findFirst({
      where: {
        ...whereClause,
        step: dto.step,
      },
    });

    if (duplicatedStep) {
      throw new ConflictException('Bước (step) đã tồn tại trong procedure này');
    }
  }

  private buildSubprocessData(dto: CreateSubprocessDto) {
    return {
      name: dto.name,
      description: dto.description,
      estimatedNumberOfDays: dto.estimatedNumberOfDays,
      numberOfDaysBeforeDeadline: dto.numberOfDaysBeforeDeadline,
      roleOfThePersonInCharge: dto.roleOfThePersonInCharge,
      isRequired: dto.isRequired ?? false,
      isStepWithCost: dto.isStepWithCost ?? false,
      procedureId: dto.procedureId,
      step: dto.step,
      departmentId: dto.departmentId,
    };
  }

  private getSubprocessSelectFields() {
    return {
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
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
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

    if (dto.step !== undefined || dto.procedureId !== undefined) {
      const targetStep =
        dto.step !== undefined ? dto.step : existingSubprocess.step;
      const targetProcedureId =
        dto.procedureId || existingSubprocess.procedureId;

      const duplicatedStep = await this.prismaService.subprocess.findFirst({
        where: {
          step: targetStep,
          procedureId: targetProcedureId,
          NOT: { id },
        },
      });

      if (duplicatedStep) {
        throw new ConflictException(
          'Bước (step) đã tồn tại trong quy trình này',
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
        department: {
          select: {
            id: true,
            name: true,
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

  async reorderSteps(dto: ReorderStepsDto) {
    const procedure = await this.prismaService.procedure.findUnique({
      where: { id: dto.procedureId },
    });
    if (!procedure) {
      throw new NotFoundException(
        `Không tìm thấy quy trình với ID ${dto.procedureId}`,
      );
    }

    const stepValues = dto.steps.map((s) => s.step);
    const hasDuplicateStep = stepValues.length !== new Set(stepValues).size;
    if (hasDuplicateStep) {
      throw new ConflictException('Giá trị step bị trùng lặp trong payload');
    }

    await this.prismaService.$transaction(async (tx) => {
      for (const item of dto.steps) {
        const subprocess = await tx.subprocess.findUnique({
          where: { id: item.id },
        });
        if (!subprocess) {
          throw new NotFoundException(
            `Không tìm thấy subprocess với ID ${item.id}`,
          );
        }
        if (subprocess.procedureId !== dto.procedureId) {
          throw new ConflictException('Subprocess không thuộc procedure này');
        }
        const duplicate = await tx.subprocess.findFirst({
          where: {
            procedureId: dto.procedureId,
            step: item.step,
            NOT: { id: item.id },
          },
        });
        if (duplicate) {
          throw new ConflictException('Step đã tồn tại trong procedure');
        }
        await tx.subprocess.update({
          where: { id: item.id },
          data: { step: item.step },
        });
      }
    });

    return { message: 'Cập nhật thứ tự bước thành công' };
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
