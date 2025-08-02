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
    try {
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
          sameAssigns: {
            select: {
              id: true,
              departmentId: true,
              steps: true,
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
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
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
          sameAssigns: {
            select: {
              id: true,
              departmentId: true,
              steps: true,
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
    } catch (error) {
      throw error;
    }
  }

  async create(dto: CreateProcedureDto) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdate(dto: CreateOrUpdateProcedureDto) {
    try {
      const { id, subprocesses = [], sameAssign = [], ...procedureData } = dto;

      if (id) {
        const existingProcedure = await this.prismaService.procedure.findUnique(
          {
            where: { id },
          },
        );
        if (!existingProcedure) {
          throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
        }

        const result = await this.prismaService.$transaction(async (tx) => {
          await tx.subprocess.deleteMany({ where: { procedureId: id } });
          await tx.sameAssign.deleteMany({ where: { procedureId: id } });

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

          if (sameAssign.length > 0) {
            const sameAssignData = sameAssign.map((assign) => ({
              departmentId: assign.departmentId,
              steps: assign.steps,
              procedureId: id,
            }));

            await tx.sameAssign.createMany({
              data: sameAssignData,
            });

            for (const assign of sameAssign) {
              const { departmentId, steps } = assign;

              const procedureSubprocesses = await tx.subprocess.findMany({
                where: { procedureId: id },
              });

              for (const step of steps) {
                const subprocessToUpdate = procedureSubprocesses.find(
                  (sp) => sp.step === step,
                );

                if (subprocessToUpdate) {
                  await tx.subprocess.update({
                    where: { id: subprocessToUpdate.id },
                    data: { departmentId },
                  });
                }
              }
            }
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

        if (sameAssign.length > 0) {
          const sameAssignData = sameAssign.map((assign) => ({
            departmentId: assign.departmentId,
            steps: assign.steps,
            procedureId: created.id,
          }));

          await tx.sameAssign.createMany({
            data: sameAssignData,
          });

          for (const assign of sameAssign) {
            const { departmentId, steps } = assign;

            const procedureSubprocesses = await tx.subprocess.findMany({
              where: { procedureId: created.id },
            });

            for (const step of steps) {
              const subprocessToUpdate = procedureSubprocesses.find(
                (sp) => sp.step === step,
              );

              if (subprocessToUpdate) {
                await tx.subprocess.update({
                  where: { id: subprocessToUpdate.id },
                  data: { departmentId },
                });
              }
            }
          }
        }

        return created;
      });

      return {
        message: 'Tạo quy trình thành công',
        data: await this.findOne(newProcedure.id),
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, dto: UpdateProcedureDto) {
    try {
      const existingProcedure = await this.prismaService.procedure.findUnique({
        where: { id },
      });

      if (!existingProcedure) {
        throw new NotFoundException(`Không tìm thấy quy trình với ID ${id}`);
      }

      if (dto.name) {
        const duplicatedProcedure =
          await this.prismaService.procedure.findFirst({
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
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
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
    } catch (error) {
      throw error;
    }
  }
}
