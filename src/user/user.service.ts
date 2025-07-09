import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDTO,
  UpdateUserByIdDTO,
  CreateDTO,
  UpdateDTO,
  FilterUserDTO,
  UpdateProfileDTO,
} from './dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';
import { TokenService } from 'src/common/token/token.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async createUser(dto: CreateUserDTO) {
    const duplicatedEmailAddress = await this.findUserByEmail(dto.email);
    if (duplicatedEmailAddress) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const duplicatedUsername = await this.findUserByUsername(dto.userName);
    if (duplicatedUsername) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    const passwordHashed = await this.hashService.encode(dto.password);
    const verificationCode = this.tokenService.generateVerificationToken();
    return this.prismaService.user.create({
      data: {
        email: dto.email,
        password: passwordHashed,
        fullName: dto.fullName,
        userName: dto.userName,
        phoneNumber: dto.phoneNumber,
        role: dto.role,
        verifiedToken: verificationCode,
      },
    });
  }

  async updateVerificationState(
    id: number,
    isVerify: boolean,
    verifiedToken?: string,
  ) {
    let data: Record<string, any> = {};
    if (isVerify) {
      data = {
        isVerifiedAccount: true,
        verifiedDate: new Date(),
        verifiedToken: null,
      };
    } else {
      data = {
        isVerifiedAccount: false,
        verifiedDate: null,
        verifiedToken,
      };
    }
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async updateUserById(id: number, dto: UpdateUserByIdDTO) {
    if (dto.password) {
      dto.password = await this.hashService.encode(dto.password);
    }

    return this.prismaService.user.update({ where: { id }, data: dto });
  }

  async findUserByEmailAndPassword(email: string, password: string) {
    const user = await this.findUserByEmail(email, true);
    const isPasswordMatching = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new NotFoundException('Email hoặc mật khẩu không đúng');
    }
    return user;
  }

  async findUserByEmail(email: string, throwError: boolean = false) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user && throwError) {
      throw new NotFoundException('Không tìm thấy người dùng với email này');
    }
    return user;
  }

  async findUserById(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với ID này');
    }
    return user;
  }

  async findUserByUsername(username: string, throwError: boolean = false) {
    const user = await this.prismaService.user.findUnique({
      where: { userName: username },
    });
    if (!user && throwError) {
      throw new NotFoundException('Không tìm thấy người dùng với username này');
    }
    return user;
  }

  async findUserByEmailOrUsernameAndPassword(
    emailOrUsername: string,
    password: string,
  ) {
    let user = await this.findUserByEmail(emailOrUsername);

    if (!user) {
      user = await this.findUserByUsername(emailOrUsername);
    }

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email hoặc username này',
      );
    }

    const isPasswordMatching = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new NotFoundException('Email/Username hoặc mật khẩu không đúng');
    }
    return user;
  }

  async findUserByPhoneNumber(
    phoneNumber: string,
    throwError: boolean = false,
  ) {
    // Return null if phoneNumber is undefined or null
    if (!phoneNumber) {
      if (throwError) {
        throw new NotFoundException(
          'Không tìm thấy người dùng với số điện thoại này',
        );
      }
      return null;
    }

    const user = await this.prismaService.user.findUnique({
      where: { phoneNumber },
    });
    if (!user && throwError) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với số điện thoại này',
      );
    }
    return user;
  }

  async findAll(filters?: FilterUserDTO) {
    const whereCondition: any = {};

    if (filters) {
      if (filters.fullName) {
        whereCondition.fullName = {
          contains: filters.fullName,
          mode: 'insensitive',
        };
      }

      if (filters.userName) {
        whereCondition.userName = {
          contains: filters.userName,
          mode: 'insensitive',
        };
      }

      if (filters.email) {
        whereCondition.email = {
          contains: filters.email,
          mode: 'insensitive',
        };
      }

      if (filters.phoneNumber) {
        whereCondition.phoneNumber = {
          contains: filters.phoneNumber,
        };
      }

      if (filters.isVerifiedAccount !== undefined) {
        whereCondition.isVerifiedAccount = filters.isVerifiedAccount;
      }

      if (filters.role) {
        whereCondition.role = filters.role;
      }

      if (filters.departmentId) {
        whereCondition.departmentId = filters.departmentId;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    const total = await this.prismaService.user.count({
      where: whereCondition,
    });

    const data = await this.prismaService.user.findMany({
      where: whereCondition,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        createdAt: true,
        role: true,
        lastLoginDate: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return { data, page, limit, total };
  }

  async findOne(id: number) {
    const data = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        createdAt: true,
        role: true,
        lastLoginDate: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return { data };
  }

  async create(dto: CreateDTO) {
    const duplicatedEmailAddress = await this.findUserByEmail(dto.email);
    if (duplicatedEmailAddress) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const duplicatedUsername = await this.findUserByUsername(dto.userName);
    if (duplicatedUsername) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    const duplicatedPhoneNumber = await this.findUserByPhoneNumber(
      dto.phoneNumber,
    );
    if (duplicatedPhoneNumber) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    if (dto.departmentId) {
      const department = await this.prismaService.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Không tìm thấy phòng ban với ID ${dto.departmentId}`,
        );
      }
    }

    const passwordHashed = await this.hashService.encode(dto.password);

    const newUser = await this.prismaService.user.create({
      data: {
        email: dto.email,
        password: passwordHashed,
        fullName: dto.fullName,
        userName: dto.userName,
        phoneNumber: dto.phoneNumber,
        role: dto.role,
        departmentId: dto.departmentId,
        verifiedToken: null,
        isVerifiedAccount: true,
        verifiedDate: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        createdAt: true,
        role: true,
        lastLoginDate: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      message: 'Tạo người dùng thành công',
      data: newUser,
    };
  }

  async update(id: number, dto: UpdateDTO) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!existingUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const duplicatedEmailAddress = await this.findUserByEmail(dto.email);
      if (duplicatedEmailAddress) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    if (dto.userName && dto.userName !== existingUser.userName) {
      const duplicatedUsername = await this.findUserByUsername(dto.userName);
      if (duplicatedUsername) {
        throw new ConflictException('Tên đăng nhập đã được sử dụng');
      }
    }

    if (dto.phoneNumber && dto.phoneNumber !== existingUser.phoneNumber) {
      const duplicatedPhoneNumber = await this.findUserByPhoneNumber(
        dto.phoneNumber,
      );
      if (duplicatedPhoneNumber) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    if (dto.departmentId && dto.departmentId !== existingUser.departmentId) {
      const department = await this.prismaService.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Không tìm thấy phòng ban với ID ${dto.departmentId}`,
        );
      }
    }

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await this.hashService.encode(dto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        createdAt: true,
        role: true,
        lastLoginDate: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    };
  }

  async delete(id: number) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    await this.prismaService.user.delete({ where: { id } });

    return {
      message: 'Xóa người dùng thành công',
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDTO) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const duplicatedEmailAddress = await this.findUserByEmail(dto.email);
      if (duplicatedEmailAddress) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    if (dto.userName && dto.userName !== existingUser.userName) {
      const duplicatedUsername = await this.findUserByUsername(dto.userName);
      if (duplicatedUsername) {
        throw new ConflictException('Tên đăng nhập đã được sử dụng');
      }
    }

    if (dto.phoneNumber && dto.phoneNumber !== existingUser.phoneNumber) {
      const duplicatedPhoneNumber = await this.findUserByPhoneNumber(
        dto.phoneNumber,
      );
      if (duplicatedPhoneNumber) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const updateData: any = { ...dto };

    if (dto.password) {
      updateData.password = await this.hashService.encode(dto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        createdAt: true,
        role: true,
        lastLoginDate: true,
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật profile thành công',
      data: updatedUser,
    };
  }
}
