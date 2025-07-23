import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CreateSubprocessesHistoryDto,
  UpdateSubprocessesHistoryDto,
  FilterSubprocessesHistoryDto,
} from './dto';

@Injectable()
export class SubprocessesHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterSubprocessesHistoryDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.name) {
        whereCondition.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }
      if (filters.procedureId) {
        whereCondition.procedureId = filters.procedureId;
      }
      if (filters.departmentId) {
        whereCondition.departmentId = filters.departmentId;
      }
      if (filters.userId) {
        whereCondition.userId = filters.userId;
      }
      if (filters.status) {
        whereCondition.status = filters.status;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.subprocessHistory.count({
      where: whereCondition,
    });

    const data = await this.prismaService.subprocessHistory.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        procedure: true,
        department: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
      include: {
        procedure: true,
        department: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(
        `Không tìm thấy lịch sử quy trình với ID ${id}`,
      );
    }

    return { data };
  }

  async create(dto: CreateSubprocessesHistoryDto) {
    const newSubprocessHistory =
      await this.prismaService.subprocessHistory.create({
        data: {
          name: dto.name,
          description: dto.description,
          estimatedNumberOfDays: dto.estimatedNumberOfDays,
          numberOfDaysBeforeDeadline: dto.numberOfDaysBeforeDeadline,
          roleOfThePersonInCharge: dto.roleOfThePersonInCharge,
          isRequired: dto.isRequired,
          isStepWithCost: dto.isStepWithCost,
          step: dto.step,
          procedureId: dto.procedureId,
          departmentId: dto.departmentId,
          price: dto.price,
          startDate: dto.startDate,
          endDate: dto.endDate,
          status: dto.status,
          userId: dto.userId,
        },
        include: {
          procedure: true,
          department: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

    return {
      message: 'Tạo lịch sử quy trình thành công',
      data: newSubprocessHistory,
    };
  }

  async update(id: number, dto: UpdateSubprocessesHistoryDto) {
    const existing = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy lịch sử quy trình với ID ${id}`,
      );
    }

    const updated = await this.prismaService.subprocessHistory.update({
      where: { id },
      data: dto,
      include: {
        procedure: true,
        department: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật lịch sử quy trình thành công',
      data: updated,
    };
  }

  async remove(id: number) {
    const existing = await this.prismaService.subprocessHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy lịch sử quy trình với ID ${id}`,
      );
    }

    await this.prismaService.subprocessHistory.delete({ where: { id } });

    return {
      message: 'Xóa lịch sử quy trình thành công',
    };
  }
}
