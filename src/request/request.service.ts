import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class RequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(filters?: FilterRequestDto) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.title) {
        whereCondition.title = {
          contains: filters.title,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        whereCondition.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.source) {
        whereCondition.source = filters.source;
      }

      if (filters.customerId) {
        whereCondition.customerId = filters.customerId;
      }

      if (filters.sourceOtherId) {
        whereCondition.sourceOtherId = filters.sourceOtherId;
      }

      if (filters.statusProductId) {
        whereCondition.statusProductId = filters.statusProductId;
      }

      if (filters.userId) {
        whereCondition.userId = filters.userId;
      }

      if (filters.materialType) {
        whereCondition.requestMaterials = {
          some: {
            material: {
              type: filters.materialType,
              isActive: true,
            },
          },
        };
      }

      if (filters.status) {
        whereCondition.status = filters.status;
      }
    }

    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 100);

    const total = await this.prismaService.request.count({
      where: whereCondition,
    });

    const data = await this.prismaService.request.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return { data };
  }

  async create(dto: CreateRequestDto) {
    // Validate related entities in parallel for better performance
    const validationPromises = [];

    if (dto.customerId) {
      validationPromises.push(
        this.prismaService.customer
          .findUnique({
            where: { id: dto.customerId },
            select: { id: true },
          })
          .then((customerExists) => {
            if (!customerExists) {
              throw new NotFoundException(
                `Không tìm thấy khách hàng với ID ${dto.customerId}`,
              );
            }
          }),
      );
    }

    if (dto.userId) {
      validationPromises.push(
        this.prismaService.user
          .findUnique({
            where: { id: dto.userId },
            select: { id: true },
          })
          .then((userExists) => {
            if (!userExists) {
              throw new NotFoundException(
                `Không tìm thấy người dùng với ID ${dto.userId}`,
              );
            }
          }),
      );
    }

    if (dto.sourceOtherId) {
      validationPromises.push(
        this.prismaService.sourceOther
          .findUnique({
            where: { id: dto.sourceOtherId },
            select: { id: true },
          })
          .then((sourceOtherExists) => {
            if (!sourceOtherExists) {
              throw new NotFoundException(
                `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
              );
            }
          }),
      );
    }

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    // Validate and process materials
    let validatedMaterials: any[] = [];
    if (dto.materials?.length > 0) {
      // Remove duplicate materials based on materialId and keep the last occurrence
      const materialMap = new Map();
      dto.materials.forEach((material) => {
        materialMap.set(material.materialId, material);
      });
      const uniqueMaterials = Array.from(materialMap.values());

      // Get all material IDs
      const materialIds = uniqueMaterials.map((m) => m.materialId);

      // Fetch materials from database
      const existingMaterials = await this.prismaService.material.findMany({
        where: {
          id: { in: materialIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          type: true,
        },
      });

      // Check if all materials exist and are active
      if (existingMaterials.length !== materialIds.length) {
        const existingIds = existingMaterials.map((m) => m.id);
        const missingIds = materialIds.filter(
          (id) => !existingIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
        );
      }

      // Create a map for faster lookup
      const materialLookup = new Map(existingMaterials.map((m) => [m.id, m]));

      // Validate each material
      for (const reqMaterial of uniqueMaterials) {
        // Check quantity is positive (redundant check since DTO validation should handle this)
        if (reqMaterial.quantity <= 0) {
          throw new BadRequestException(
            `Số lượng phải lớn hơn 0 cho vật liệu với ID ${reqMaterial.materialId}`,
          );
        }

        // Find the material in database using map lookup
        const material = materialLookup.get(reqMaterial.materialId);

        // This check is actually redundant since we already validated all materials exist above
        if (!material) {
          throw new NotFoundException(
            `Không tìm thấy vật liệu với ID ${reqMaterial.materialId}`,
          );
        }

        // Validate material type matches what client specified
        if (material.type !== reqMaterial.materialType) {
          throw new BadRequestException(
            `Vật liệu ${material.name} có loại ${material.type}, không phải ${reqMaterial.materialType}`,
          );
        }

        // Check if requested quantity is available
        if (reqMaterial.quantity > material.quantity) {
          throw new BadRequestException(
            `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
          );
        }
      }

      validatedMaterials = uniqueMaterials;
    }

    // Prepare request data
    const requestData: any = {
      title: dto.title,
      description: dto.description,
      productLink: dto.productLink || [],
      media: dto.media || [],
      source: dto.source,
      userId: dto.userId || null,
      customerId: dto.customerId || null,
      sourceOtherId: dto.sourceOtherId || null,
    };

    // Add request materials if any
    if (validatedMaterials.length > 0) {
      requestData.requestMaterials = {
        create: validatedMaterials.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
        })),
      };
    }

    // Add request input if provided
    if (dto.requestInput) {
      requestData.requestInputs = {
        create: {
          quantity: dto.requestInput.quantity,
          expectedDate: new Date(dto.requestInput.expectedDate),
          supplier: dto.requestInput.supplier,
          sourceCountry: dto.requestInput.sourceCountry,
          price: dto.requestInput.price,
          reason: dto.requestInput.reason,
          materialId: dto.requestInput.materialId,
        },
      };
    }

    // Create the request
    const newRequest = await this.prismaService.request.create({
      data: requestData,
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      message: 'Tạo yêu cầu thành công',
      data: newRequest,
    };
  }

  async update(id: number, dto: UpdateRequestDto) {
    // Kiểm tra request tồn tại
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    // Kiểm tra các thực thể liên quan
    const validationPromises = [];

    if (dto.customerId) {
      validationPromises.push(
        this.prismaService.customer
          .findUnique({
            where: { id: dto.customerId },
            select: { id: true },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Không tìm thấy khách hàng với ID ${dto.customerId}`,
              );
          }),
      );
    }

    if (dto.userId) {
      validationPromises.push(
        this.prismaService.user
          .findUnique({
            where: { id: dto.userId },
            select: { id: true },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Không tìm thấy người dùng với ID ${dto.userId}`,
              );
          }),
      );
    }

    if (dto.sourceOtherId) {
      validationPromises.push(
        this.prismaService.sourceOther
          .findUnique({
            where: { id: dto.sourceOtherId },
            select: { id: true },
          })
          .then((res) => {
            if (!res)
              throw new NotFoundException(
                `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
              );
          }),
      );
    }

    await Promise.all(validationPromises);

    // Validate và xử lý materials
    let validatedMaterials: any[] = [];
    if (dto.materials?.length > 0) {
      const materialMap = new Map();
      dto.materials.forEach((m) => materialMap.set(m.materialId, m));
      const uniqueMaterials = Array.from(materialMap.values());
      const materialIds = uniqueMaterials.map((m) => m.materialId);

      const existingMaterials = await this.prismaService.material.findMany({
        where: {
          id: { in: materialIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          type: true,
        },
      });

      if (existingMaterials.length !== materialIds.length) {
        const existingIds = existingMaterials.map((m) => m.id);
        const missingIds = materialIds.filter(
          (id) => !existingIds.includes(id),
        );
        throw new NotFoundException(
          `Không tìm thấy vật liệu hoạt động với ID: ${missingIds.join(', ')}`,
        );
      }

      const materialLookup = new Map(existingMaterials.map((m) => [m.id, m]));

      for (const reqMaterial of uniqueMaterials) {
        if (reqMaterial.quantity <= 0) {
          throw new BadRequestException(
            `Số lượng phải lớn hơn 0 cho vật liệu ID ${reqMaterial.materialId}`,
          );
        }

        const material = materialLookup.get(reqMaterial.materialId);

        if (!material) continue;

        if (material.type !== reqMaterial.materialType) {
          throw new BadRequestException(
            `Vật liệu ${material.name} có loại ${material.type}, không phải ${reqMaterial.materialType}`,
          );
        }

        if (reqMaterial.quantity > material.quantity) {
          throw new BadRequestException(
            `Số lượng yêu cầu (${reqMaterial.quantity}) vượt quá số lượng có sẵn (${material.quantity}) của vật liệu ${material.name}`,
          );
        }
      }

      validatedMaterials = uniqueMaterials;

      // Xoá và thêm lại vật liệu
      await this.prismaService.requestMaterial.deleteMany({
        where: { requestId: id },
      });

      await this.prismaService.requestMaterial.createMany({
        data: validatedMaterials.map((m) => ({
          requestId: id,
          materialId: m.materialId,
          quantity: m.quantity,
        })),
      });
    }

    // Cập nhật requestInput (do không có quan hệ ngược trong model nên phải xử lý riêng)
    if (dto.requestInput) {
      // Do materialId là unique trong RequestInput → chỉ tồn tại duy nhất 1
      await this.prismaService.requestInput.upsert({
        where: { materialId: dto.requestInput.materialId },
        create: {
          materialId: dto.requestInput.materialId,
          quantity: dto.requestInput.quantity,
          expectedDate: dto.requestInput.expectedDate
            ? new Date(dto.requestInput.expectedDate)
            : null,
          supplier: dto.requestInput.supplier,
          sourceCountry: dto.requestInput.sourceCountry,
          price: dto.requestInput.price,
          reason: dto.requestInput.reason,
        },
        update: {
          quantity: dto.requestInput.quantity,
          expectedDate: dto.requestInput.expectedDate
            ? new Date(dto.requestInput.expectedDate)
            : null,
          supplier: dto.requestInput.supplier,
          sourceCountry: dto.requestInput.sourceCountry,
          price: dto.requestInput.price,
          reason: dto.requestInput.reason,
        },
      });
    }

    // Cập nhật request chính
    const updateData: any = {
      title: dto.title,
      description: dto.description,
      productLink: dto.productLink || [],
      media: dto.media || [],
      source: dto.source,
      userId: dto.userId || null,
      customerId: dto.customerId || null,
      sourceOtherId: dto.sourceOtherId || null,
    };

    const updatedRequest = await this.prismaService.request.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: { material: true },
          orderBy: { material: { name: 'asc' } },
        },
      },
    });

    return {
      message: 'Cập nhật yêu cầu thành công',
      data: updatedRequest,
    };
  }

  async updateStatus(id: number, status: RequestStatus) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    if (existingRequest.status === status) {
      throw new BadRequestException(
        'Trạng thái mới trùng với trạng thái hiện tại',
      );
    }

    const updatedRequest = await this.prismaService.request.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: true,
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
      },
    });

    return {
      message: 'Cập nhật trạng thái yêu cầu thành công',
      data: updatedRequest,
    };
  }

  async remove(id: number) {
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    await this.prismaService.request.delete({ where: { id } });

    return {
      message: 'Xóa yêu cầu thành công',
    };
  }

  async getMaterialsByType(type?: string) {
    const materials = await this.prismaService.material.findMany({
      where: {
        isActive: true,
        ...(type && { type: type as any }),
      },
      include: {
        origin: true,
      },
      orderBy: { name: 'asc' },
    });

    return { data: materials };
  }

  async getRequestStatistics() {
    const [total, bySource, materialStats] = await Promise.all([
      this.prismaService.request.count(),

      this.prismaService.request.groupBy({
        by: ['source'],
        _count: true,
      }),

      this.prismaService.requestMaterial.findMany({
        select: {
          requestId: true,
          material: {
            select: {
              type: true,
            },
          },
        },
      }),
    ]);

    // Map requestId -> unique material types
    const requestMaterialTypeMap = new Map<number, Set<string>>();
    materialStats.forEach(({ requestId, material }) => {
      if (!requestMaterialTypeMap.has(requestId)) {
        requestMaterialTypeMap.set(requestId, new Set());
      }
      requestMaterialTypeMap.get(requestId)!.add(material.type);
    });

    // Aggregate by type
    const materialTypeStats: Record<string, number> = {};
    for (const types of requestMaterialTypeMap.values()) {
      types.forEach((type) => {
        materialTypeStats[type] = (materialTypeStats[type] || 0) + 1;
      });
    }

    return {
      total,
      bySource: bySource.map((item) => ({
        source: item.source,
        count: item._count,
      })),
      byMaterialType: Object.entries(materialTypeStats).map(
        ([type, count]) => ({
          type,
          count,
        }),
      ),
    };
  }
}
