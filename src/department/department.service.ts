import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  FilterDepartmentDTO,
} from './dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterDepartmentDTO) {
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

        if (filters.headId !== undefined) {
          whereCondition.headId = filters.headId;
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;

      const total = await this.prismaService.department.count({
        where: whereCondition,
      });

      const data = await this.prismaService.department.findMany({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          headId: true,
          head: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
              phoneNumber: true,
              role: true,
            },
          },
          members: {
            select: {
              id: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return { data, page, limit, total };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách phòng ban: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prismaService.department.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          headId: true,
          head: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
              phoneNumber: true,
              role: true,
            },
          },
          members: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
              phoneNumber: true,
              role: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!data) {
        throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
      }

      return { data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Lỗi khi tìm phòng ban: ${error.message}`);
    }
  }

  async create(dto: CreateDepartmentDTO) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        await this.validateDepartmentNameUniqueness(dto.name, undefined, tx);

        if (dto.headId) {
          await this.validateHeadUser(dto.headId, undefined, tx);
        }

        const processedMemberIds = dto.memberIds
          ? await this.validateAndProcessMemberIds(
              dto.memberIds,
              dto.headId,
              undefined,
              tx,
            )
          : [];

        const newDepartment = await tx.department.create({
          data: {
            name: dto.name,
            description: dto.description,
            headId: dto.headId,
          },
          select: {
            id: true,
            name: true,
            description: true,
            headId: true,
            head: {
              select: {
                id: true,
                fullName: true,
                userName: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        });

        if (processedMemberIds.length > 0) {
          await this.assignMembersToDepartment(
            processedMemberIds,
            newDepartment.id,
            tx,
          );
        }

        const departmentWithMembers = await this.getDepartmentWithMembers(
          newDepartment.id,
          tx,
        );

        return {
          message: 'Tạo phòng ban thành công',
          data: departmentWithMembers,
        };
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi tạo phòng ban: ${error.message}`);
    }
  }

  async update(id: number, dto: UpdateDepartmentDTO) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const existingDepartment = await tx.department.findUnique({
          where: { id },
        });

        if (!existingDepartment) {
          throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
        }

        if (dto.name && dto.name !== existingDepartment.name) {
          await this.validateDepartmentNameUniqueness(dto.name, id, tx);
        }

        if (dto.headId !== undefined) {
          if (dto.headId !== null) {
            await this.validateHeadUser(dto.headId, id, tx);
          }
        }

        const processedMemberIds =
          dto.memberIds !== undefined
            ? await this.validateAndProcessMemberIds(
                dto.memberIds,
                dto.headId,
                id,
                tx,
              )
            : undefined;

        const { memberIds, ...departmentData } = dto;
        await tx.department.update({
          where: { id },
          data: departmentData,
        });

        if (processedMemberIds !== undefined) {
          await this.reassignDepartmentMembers(id, processedMemberIds, tx);
        }

        const departmentWithMembers = await this.getDepartmentWithMembers(
          id,
          tx,
        );

        return {
          message: 'Cập nhật phòng ban thành công',
          data: departmentWithMembers,
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi cập nhật phòng ban: ${error.message}`);
    }
  }

  async delete(id: number) {
    try {
      const existingDepartment = await this.prismaService.department.findUnique(
        {
          where: { id },
          include: {
            members: true,
          },
        },
      );

      if (!existingDepartment) {
        throw new NotFoundException(`Không tìm thấy phòng ban với ID ${id}`);
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.user.updateMany({
          where: { departmentId: id },
          data: { departmentId: null },
        });

        await tx.department.delete({ where: { id } });
      });

      return {
        message: 'Xóa phòng ban thành công',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi xóa phòng ban: ${error.message}`);
    }
  }

  async findDepartmentByName(name: string) {
    try {
      return await this.prismaService.department.findUnique({
        where: { name },
      });
    } catch (error) {
      throw new Error(`Lỗi khi tìm phòng ban theo tên: ${error.message}`);
    }
  }

  async assignUserToDepartment(userId: number, departmentId: number) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${userId}`,
        );
      }

      const existingDepartment = await this.prismaService.department.findUnique(
        {
          where: { id: departmentId },
        },
      );

      if (!existingDepartment) {
        throw new NotFoundException(
          `Không tìm thấy phòng ban với ID ${departmentId}`,
        );
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: { departmentId },
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        message: 'Phân công người dùng vào phòng ban thành công',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Lỗi khi phân công người dùng vào phòng ban: ${error.message}`,
      );
    }
  }

  async removeUserFromDepartment(userId: number) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${userId}`,
        );
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: { departmentId: null },
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
        },
      });

      return {
        message: 'Loại bỏ người dùng khỏi phòng ban thành công',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Lỗi khi loại bỏ người dùng khỏi phòng ban: ${error.message}`,
      );
    }
  }

  private async validateDepartmentNameUniqueness(
    name: string,
    excludeId?: number,
    tx?: any,
  ) {
    try {
      const prisma = tx || this.prismaService;
      const whereCondition: any = { name };

      if (excludeId) {
        whereCondition.id = { not: excludeId };
      }

      const existingDepartment = await prisma.department.findFirst({
        where: whereCondition,
      });

      if (existingDepartment) {
        throw new ConflictException('Tên phòng ban đã tồn tại');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Lỗi khi kiểm tra tên phòng ban: ${error.message}`);
    }
  }

  private async validateHeadUser(
    headId: number,
    excludeDepartmentId?: number,
    tx?: any,
  ) {
    try {
      const prisma = tx || this.prismaService;

      const existingHead = await prisma.user.findUnique({
        where: { id: headId },
      });

      if (!existingHead) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${headId}`,
        );
      }

      const whereCondition: any = { headId };
      if (excludeDepartmentId) {
        whereCondition.id = { not: excludeDepartmentId };
      }

      const existingHeadOfDepartment = await prisma.department.findFirst({
        where: whereCondition,
      });

      if (existingHeadOfDepartment) {
        throw new ConflictException(
          'Người này đã là trưởng phòng của phòng ban khác',
        );
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi kiểm tra trưởng phòng: ${error.message}`);
    }
  }

  private async validateAndProcessMemberIds(
    memberIds: number[],
    headId?: number,
    departmentId?: number,
    tx?: any,
  ): Promise<number[]> {
    try {
      if (!memberIds || memberIds.length === 0) {
        return [];
      }

      const prisma = tx || this.prismaService;
      const uniqueMemberIds = [...new Set(memberIds)];

      const existingUsers = await prisma.user.findMany({
        where: { id: { in: uniqueMemberIds } },
        select: { id: true, departmentId: true },
      });

      if (existingUsers.length !== uniqueMemberIds.length) {
        const foundIds = existingUsers.map((user) => user.id);
        const missingIds = uniqueMemberIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID: ${missingIds.join(', ')}`,
        );
      }

      const usersWithOtherDepartment = existingUsers.filter(
        (user) =>
          user.departmentId !== null && user.departmentId !== departmentId,
      );

      if (usersWithOtherDepartment.length > 0) {
        const conflictIds = usersWithOtherDepartment.map((user) => user.id);
        throw new ConflictException(
          `Các người dùng với ID ${conflictIds.join(', ')} đã thuộc phòng ban khác`,
        );
      }

      return uniqueMemberIds.filter((memberId) => memberId !== headId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Lỗi khi kiểm tra thành viên: ${error.message}`);
    }
  }

  private async assignMembersToDepartment(
    memberIds: number[],
    departmentId: number,
    tx?: any,
  ) {
    try {
      const prisma = tx || this.prismaService;

      if (memberIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: memberIds } },
          data: { departmentId },
        });
      }
    } catch (error) {
      throw new Error(
        `Lỗi khi phân công thành viên vào phòng ban: ${error.message}`,
      );
    }
  }

  private async reassignDepartmentMembers(
    departmentId: number,
    newMemberIds: number[],
    tx?: any,
  ) {
    try {
      const prisma = tx || this.prismaService;

      await prisma.user.updateMany({
        where: { departmentId },
        data: { departmentId: null },
      });

      await this.assignMembersToDepartment(newMemberIds, departmentId, tx);
    } catch (error) {
      throw new Error(
        `Lỗi khi cập nhật thành viên phòng ban: ${error.message}`,
      );
    }
  }

  private async getDepartmentWithMembers(departmentId: number, tx?: any) {
    try {
      const prisma = tx || this.prismaService;

      return await prisma.department.findUnique({
        where: { id: departmentId },
        select: {
          id: true,
          name: true,
          description: true,
          headId: true,
          head: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
            },
          },
          members: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy thông tin phòng ban với thành viên: ${error.message}`,
      );
    }
  }
}
