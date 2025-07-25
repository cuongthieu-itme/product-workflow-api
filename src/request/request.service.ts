import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { NotificationAdminService } from 'src/notification-admin/notification-admin.service';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';

@Injectable()
export class RequestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationAdminService: NotificationAdminService,
  ) {}

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
        createdBy: true,
        customer: true,
        sourceOther: true,
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
                requestInput: true,
                requestMaterials: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                step: 'asc',
              },
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
        createdBy: true,
        customer: true,
        sourceOther: true,
        statusProduct: {
          include: {
            procedure: {
              include: {
                subprocesses: true,
              },
            },
          },
        },
        requestMaterials: {
          include: {
            material: {
              include: {
                origin: true,
                requestInput: true,
                requestMaterials: true,
              },
            },
          },
          orderBy: {
            material: {
              name: 'asc',
            },
          },
        },
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                step: 'asc',
              },
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

  async create(createRequestDto: CreateRequestDto) {
    const {
      title,
      description,
      productLink,
      media,
      source,
      createdById,
      customerId,
      sourceOtherId,
      statusProductId,
      materials,
    } = createRequestDto;

    // Validate relationships first
    await this.validateRelationships(createRequestDto);

    // Validate materials if provided
    if (materials && materials.length > 0) {
      await this.validateMaterials(materials.map((m) => m.materialId));

      // Check for duplicate materials
      const materialIds = materials.map((m) => m.materialId);
      const duplicates = materialIds.filter(
        (id, index) => materialIds.indexOf(id) !== index,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Phát hiện nguyên vật liệu bị trùng: ${duplicates.join(', ')}`,
        );
      }
    }

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Create the main request
        const newRequest = await prisma.request.create({
          data: {
            title,
            description: description || null,
            productLink: productLink || [],
            media: media || [],
            source,
            status: 'PENDING', // Default status
            createdById: createdById || null,
            customerId: customerId || null,
            sourceOtherId: sourceOtherId || null,
            statusProductId: statusProductId || null,
          },
        });

        // Create request materials if provided
        if (materials && materials.length > 0) {
          // Create RequestMaterial entries
          await prisma.requestMaterial.createMany({
            data: materials.map((material) => ({
              requestId: newRequest.id,
              materialId: material.materialId,
              quantity: material.quantity,
            })),
          });

          // Handle RequestInput for each material
          for (const material of materials) {
            if (material.requestInput) {
              const requestInputData = {
                quantity: material.requestInput.quantity || null,
                expectedDate: material.requestInput.expectedDate
                  ? new Date(material.requestInput.expectedDate)
                  : null,
                supplier: material.requestInput.supplier || null,
                sourceCountry: material.requestInput.sourceCountry || null,
                price: material.requestInput.price || null,
                reason: material.requestInput.reason || null,
                materialId: material.materialId,
              };

              // Check if RequestInput already exists for this material
              const existingRequestInput = await prisma.requestInput.findUnique(
                {
                  where: { materialId: material.materialId },
                },
              );

              if (existingRequestInput) {
                // Update existing RequestInput
                await prisma.requestInput.update({
                  where: { materialId: material.materialId },
                  data: {
                    quantity: requestInputData.quantity,
                    expectedDate: requestInputData.expectedDate,
                    supplier: requestInputData.supplier,
                    sourceCountry: requestInputData.sourceCountry,
                    price: requestInputData.price,
                    reason: requestInputData.reason,
                  },
                });
              } else {
                // Create new RequestInput
                await prisma.requestInput.create({
                  data: requestInputData,
                });
              }
            }
          }
        }

        const infoCreatedBy = await prisma.user.findUnique({
          where: { id: createdById },
        });

        await this.notificationAdminService.create({
          title: 'Yêu cầu mới',
          content: `Yêu cầu mới bởi ${infoCreatedBy?.fullName}`,
          type: 'REQUEST',
        });

        // Return the complete request with all relations
        return await this.findByIdInternal(newRequest.id, prisma);
      });
    } catch (error) {
      console.error('Lỗi khi tạo yêu cầu:', error);

      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Dữ liệu tham chiếu không hợp lệ. Vui lòng kiểm tra lại các ID.',
        );
      }

      // Generic error
      throw new BadRequestException(
        'Tạo yêu cầu thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.',
      );
    }
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    const {
      title,
      description,
      productLink,
      media,
      source,
      createdById,
      customerId,
      sourceOtherId,
      statusProductId,
      materials,
    } = updateRequestDto;

    // Check if request exists first
    const existingRequest = await this.prismaService.request.findUnique({
      where: { id },
      include: {
        requestMaterials: true,
      },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    // Validate relationships if provided
    await this.validateRelationships(updateRequestDto);

    // Validate materials if provided
    if (materials && materials.length > 0) {
      await this.validateMaterials(materials.map((m) => m.materialId));

      // Check for duplicate materials
      const materialIds = materials.map((m) => m.materialId);
      const duplicates = materialIds.filter(
        (materialId, index) => materialIds.indexOf(materialId) !== index,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Phát hiện nguyên vật liệu bị trùng: ${duplicates.join(', ')}`,
        );
      }
    }

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Prepare update data for main request
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (productLink !== undefined)
          updateData.productLink = productLink || [];
        if (media !== undefined) updateData.media = media || [];
        if (source !== undefined) updateData.source = source;
        if (createdById !== undefined) updateData.createdById = createdById;
        if (customerId !== undefined) updateData.customerId = customerId;
        if (sourceOtherId !== undefined)
          updateData.sourceOtherId = sourceOtherId;
        if (statusProductId !== undefined)
          updateData.statusProductId = statusProductId;

        // Update main request if there's data to update
        if (Object.keys(updateData).length > 0) {
          await prisma.request.update({
            where: { id },
            data: updateData,
          });
        }

        // Handle materials update if provided
        if (materials !== undefined) {
          if (materials.length === 0) {
            // If empty array, remove all materials
            await this.removeMaterialsAndInputs(id, prisma);
          } else {
            // Get current material IDs
            const currentMaterialIds = existingRequest.requestMaterials.map(
              (rm) => rm.materialId,
            );
            const newMaterialIds = materials.map((m) => m.materialId);

            // Find materials to remove
            const materialsToRemove = currentMaterialIds.filter(
              (materialId) => !newMaterialIds.includes(materialId),
            );

            // Remove old materials and their inputs
            if (materialsToRemove.length > 0) {
              await this.removeMaterialsAndInputs(
                id,
                prisma,
                materialsToRemove,
              );
            }

            // Process new/updated materials
            for (const material of materials) {
              const existingRequestMaterial =
                existingRequest.requestMaterials.find(
                  (rm) => rm.materialId === material.materialId,
                );

              if (existingRequestMaterial) {
                // Update existing RequestMaterial
                await prisma.requestMaterial.update({
                  where: {
                    requestId_materialId: {
                      requestId: id,
                      materialId: material.materialId,
                    },
                  },
                  data: {
                    quantity: material.quantity,
                  },
                });
              } else {
                // Create new RequestMaterial
                await prisma.requestMaterial.create({
                  data: {
                    requestId: id,
                    materialId: material.materialId,
                    quantity: material.quantity,
                  },
                });
              }

              // Handle RequestInput for this material
              await this.upsertRequestInput(material, prisma);
            }
          }
        }

        const infoCreatedBy = await prisma.user.findUnique({
          where: { id: existingRequest.createdById },
        });

        await this.notificationAdminService.create({
          title: 'Yêu cầu cập nhật',
          content: `Yêu cầu cập nhật bởi ${infoCreatedBy?.fullName}`,
          type: 'REQUEST',
        });

        // Return updated request with all relations
        return await this.findByIdInternal(id, this.prismaService);
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu cầu:', error);

      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Dữ liệu tham chiếu không hợp lệ. Vui lòng kiểm tra lại các ID.',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy bản ghi để cập nhật.');
      }

      // Generic error
      throw new BadRequestException(
        'Cập nhật yêu cầu thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.',
      );
    }
  }

  /**
   * Upsert (create or update) materials for a request. Only affects materials, not other fields.
   */
  async createOrUpdateMaterials(requestId: number, materials: CreateRequestDto['materials']) {
    // Validate materials if provided
    if (materials && materials.length > 0) {
      await this.validateMaterials(materials.map((m) => m.materialId));
      // Check for duplicate materials
      const materialIds = materials.map((m) => m.materialId);
      const duplicates = materialIds.filter(
        (materialId, index) => materialIds.indexOf(materialId) !== index,
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Phát hiện nguyên vật liệu bị trùng: ${duplicates.join(', ')}`,
        );
      }
    }

    return this.prismaService.$transaction(async (prisma) => {
      // Lấy danh sách material hiện tại của request
      const existingRequest = await prisma.request.findUnique({
        where: { id: requestId },
        include: { requestMaterials: true },
      });
      if (!existingRequest) {
        throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${requestId}`);
      }
      // Nếu truyền [] thì xóa hết
      if (materials && materials.length === 0) {
        await this.removeMaterialsAndInputs(requestId, prisma);
        return this.findByIdInternal(requestId, this.prismaService);
      }
      // Upsert từng material
      for (const material of materials || []) {
        const existing = existingRequest.requestMaterials.find(
          (rm) => rm.materialId === material.materialId,
        );
        if (existing) {
          // Update
          await prisma.requestMaterial.update({
            where: {
              requestId_materialId: {
                requestId,
                materialId: material.materialId,
              },
            },
            data: { quantity: material.quantity },
          });
        } else {
          // Create
          await prisma.requestMaterial.create({
            data: {
              requestId,
              materialId: material.materialId,
              quantity: material.quantity,
            },
          });
        }
        // Upsert requestInput nếu có
        await this.upsertRequestInput(material, prisma);
      }
      // Xóa các material không còn trong danh sách mới
      if (materials) {
        const newMaterialIds = materials.map((m) => m.materialId);
        const toRemove = existingRequest.requestMaterials
          .map((rm) => rm.materialId)
          .filter((id) => !newMaterialIds.includes(id));
        if (toRemove.length > 0) {
          await this.removeMaterialsAndInputs(requestId, prisma, toRemove);
        }
      }
      return this.findByIdInternal(requestId, this.prismaService);
    });
  }

  private async validateMaterials(materialIds: number[]): Promise<void> {
    if (materialIds.length === 0) return;

    const materials = await this.prismaService.material.findMany({
      where: {
        id: { in: materialIds },
        isActive: true,
      },
    });

    const foundIds = materials.map((m) => m.id);
    const missingIds = materialIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy nguyên vật liệu đang hoạt động với ID: ${missingIds.join(', ')}`,
      );
    }
  }

  private async findByIdInternal(id: number, prisma: any = this.prismaService) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        sourceOther: {
          select: {
            id: true,
            name: true,
            specifically: true,
          },
        },
        statusProduct: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        requestMaterials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                requestInput: {
                  select: {
                    id: true,
                    quantity: true,
                    expectedDate: true,
                    supplier: true,
                    sourceCountry: true,
                    price: true,
                    reason: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return request;
  }

  private async removeMaterialsAndInputs(
    requestId: number,
    prisma: any,
    materialIds?: number[],
  ) {
    const whereClause = materialIds
      ? {
          requestId,
          materialId: { in: materialIds },
        }
      : { requestId };

    // Get materials to be removed
    const materialsToRemove = await prisma.requestMaterial.findMany({
      where: whereClause,
      select: { materialId: true },
    });

    const materialIdsToRemove = materialsToRemove.map((m) => m.materialId);

    // Remove RequestInputs for these materials
    if (materialIdsToRemove.length > 0) {
      await prisma.requestInput.deleteMany({
        where: {
          materialId: { in: materialIdsToRemove },
        },
      });
    }

    // Remove RequestMaterials
    await prisma.requestMaterial.deleteMany({
      where: whereClause,
    });
  }

  private async upsertRequestInput(
    material: { materialId: number; requestInput?: any },
    prisma: any,
  ) {
    if (!material.requestInput) {
      // If no requestInput provided, remove existing one if it exists
      await prisma.requestInput.deleteMany({
        where: { materialId: material.materialId },
      });
      return;
    }

    const requestInputData = {
      quantity: material.requestInput.quantity || null,
      expectedDate: material.requestInput.expectedDate
        ? new Date(material.requestInput.expectedDate)
        : null,
      supplier: material.requestInput.supplier || null,
      sourceCountry: material.requestInput.sourceCountry || null,
      price: material.requestInput.price || null,
      reason: material.requestInput.reason || null,
      materialId: material.materialId,
    };

    // Use upsert to create or update RequestInput
    await prisma.requestInput.upsert({
      where: { materialId: material.materialId },
      update: {
        quantity: requestInputData.quantity,
        expectedDate: requestInputData.expectedDate,
        supplier: requestInputData.supplier,
        sourceCountry: requestInputData.sourceCountry,
        price: requestInputData.price,
        reason: requestInputData.reason,
      },
      create: requestInputData,
    });
  }

  // Overloaded method for both Create and Update DTOs
  private async validateRelationships(
    dto: CreateRequestDto | UpdateRequestDto,
  ): Promise<void> {
    const validationPromises = [];

    // For UpdateRequestDto, only validate if the field is explicitly provided (not undefined)
    // For CreateRequestDto, validate if the field exists
    if (dto.createdById !== undefined && dto.createdById !== null) {
      validationPromises.push(
        this.prismaService.user
          .findUnique({
            where: { id: dto.createdById },
          })
          .then((user) => {
            if (!user) {
              throw new NotFoundException(
                `Không tìm thấy người dùng với ID ${dto.createdById}`,
              );
            }
          }),
      );
    }

    if (dto.customerId !== undefined && dto.customerId !== null) {
      validationPromises.push(
        this.prismaService.customer
          .findUnique({
            where: { id: dto.customerId },
          })
          .then((customer) => {
            if (!customer) {
              throw new NotFoundException(
                `Không tìm thấy khách hàng với ID ${dto.customerId}`,
              );
            }
          }),
      );
    }

    if (dto.sourceOtherId !== undefined && dto.sourceOtherId !== null) {
      validationPromises.push(
        this.prismaService.sourceOther
          .findUnique({
            where: { id: dto.sourceOtherId },
          })
          .then((sourceOther) => {
            if (!sourceOther) {
              throw new NotFoundException(
                `Không tìm thấy nguồn khác với ID ${dto.sourceOtherId}`,
              );
            }
          }),
      );
    }

    if (dto.statusProductId !== undefined && dto.statusProductId !== null) {
      validationPromises.push(
        this.prismaService.statusProduct
          .findUnique({
            where: { id: dto.statusProductId },
          })
          .then((statusProduct) => {
            if (!statusProduct) {
              throw new NotFoundException(
                `Không tìm thấy trạng thái sản phẩm với ID ${dto.statusProductId}`,
              );
            }
          }),
      );
    }

    await Promise.all(validationPromises);
  }

  async updateStatusAndSaveHistory(id: number, dto: UpdateRequestStatusDto) {
    return this.prismaService.$transaction(async (prisma) => {
      // 1. Lấy request hiện tại
      const request = await this.getRequestWithDetails(prisma, id);

      // 2. Validate dữ liệu đầu vào
      this.validateStatusUpdate(request, dto);

      // 3. Cập nhật request
      const updatedRequest = await this.updateRequestData(
        prisma,
        id,
        dto,
        request,
      );

      // 4. Xử lý procedure history nếu cần
      await this.handleProcedureHistory(
        prisma,
        updatedRequest,
        dto.statusProductId,
      );

      return updatedRequest;
    });
  }

  private async getRequestWithDetails(prisma: any, id: number) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        statusProduct: {
          include: {
            procedure: {
              include: {
                subprocesses: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Không tìm thấy yêu cầu với ID ${id}`);
    }

    return request;
  }

  private validateStatusUpdate(request: any, dto: UpdateRequestStatusDto) {
    // Tránh cập nhật trùng trạng thái
    if (dto.status && dto.status === request.status) {
      throw new BadRequestException(
        'Trạng thái mới trùng với trạng thái hiện tại',
      );
    }
  }

  private async updateRequestData(
    prisma: any,
    id: number,
    dto: UpdateRequestStatusDto,
    request: any,
  ) {
    const updateData: Partial<{ status: any; statusProductId: any }> = {};

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.statusProductId !== undefined) {
      updateData.statusProductId = dto.statusProductId;
    }

    // Chỉ update nếu có dữ liệu thay đổi
    if (Object.keys(updateData).length === 0) {
      return request;
    }

    return await prisma.request.update({
      where: { id },
      data: updateData,
    });
  }

  private async handleProcedureHistory(
    prisma: any,
    request: any,
    newStatusProductId?: number,
  ) {
    // Xác định statusProductId cần sử dụng
    const statusProductId = newStatusProductId ?? request.statusProductId;

    if (!statusProductId) {
      return; // Không có statusProduct thì không xử lý procedure history
    }

    // Nếu đã có procedureHistoryId thì không tạo mới
    if (request.procedureHistoryId) {
      return;
    }

    const statusProduct = await this.getStatusProductWithProcedure(
      prisma,
      statusProductId,
    );

    if (!statusProduct?.procedure) {
      return;
    }

    const procedureHistory = await this.createProcedureSnapshot(
      prisma,
      statusProduct.procedure,
    );

    await this.linkProcedureHistoryToRequest(
      prisma,
      request.id,
      procedureHistory.id,
    );
  }

  private async getStatusProductWithProcedure(
    prisma: any,
    statusProductId: number,
  ) {
    return await prisma.statusProduct.findUnique({
      where: { id: statusProductId },
      include: {
        procedure: {
          include: {
            subprocesses: true,
          },
        },
      },
    });
  }

  private async createProcedureSnapshot(prisma: any, procedure: any) {
    // Tạo procedure history
    const procedureHistory = await prisma.procedureHistory.create({
      data: {
        name: procedure.name,
        description: procedure.description,
        version: procedure.version,
      },
    });

    // Tạo subprocess history nếu có
    if (procedure.subprocesses?.length > 0) {
      await this.createSubprocessHistories(
        prisma,
        procedure.subprocesses,
        procedureHistory.id,
      );
    }

    return procedureHistory;
  }

  private async createSubprocessHistories(
    prisma: any,
    subprocesses: any[],
    procedureHistoryId: number,
  ) {
    const subprocessHistoryData = subprocesses.map((subprocess) => ({
      name: subprocess.name,
      description: subprocess.description,
      estimatedNumberOfDays: subprocess.estimatedNumberOfDays,
      numberOfDaysBeforeDeadline: subprocess.numberOfDaysBeforeDeadline,
      roleOfThePersonInCharge: subprocess.roleOfThePersonInCharge,
      isRequired: subprocess.isRequired,
      isStepWithCost: subprocess.isStepWithCost,
      step: subprocess.step,
      departmentId: subprocess.departmentId ?? null,
      procedureHistoryId,
    }));

    await prisma.subprocessHistory.createMany({
      data: subprocessHistoryData,
    });
  }

  private async linkProcedureHistoryToRequest(
    prisma: any,
    requestId: number,
    procedureHistoryId: number,
  ) {
    await prisma.request.update({
      where: { id: requestId },
      data: { procedureHistoryId },
    });
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

  async findByStatusProductIdWithHistory(statusProductId: number) {
    if (!statusProductId) {
      throw new BadRequestException('Không tìm thấy trạng thái sản phẩm');
    }
    const requests = await this.prismaService.request.findMany({
      where: { statusProductId },
      include: {
        procedureHistory: {
          include: {
            subprocessesHistory: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    userName: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { step: 'asc' },
            },
          },
        },
      },
    });
    return { data: requests };
  }

  /**
   * Xóa một material khỏi request, đồng thời xóa luôn requestInput liên quan nếu có
   */
  async removeMaterialFromRequest(requestId: number, materialId: number) {
    return this.prismaService.$transaction(async (prisma) => {
      // Xóa requestInput nếu có
      await prisma.requestInput.deleteMany({
        where: { materialId },
      });
      // Xóa requestMaterial
      await prisma.requestMaterial.deleteMany({
        where: { requestId, materialId },
      });
      // Trả về request sau khi xóa
      return this.findByIdInternal(requestId, this.prismaService);
    });
  }
}
