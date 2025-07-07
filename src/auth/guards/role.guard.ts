import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { AuthRequest } from 'src/common/types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 3,
    [UserRole.ADMIN]: 2,
    [UserRole.USER]: 1,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Không yêu cầu role cụ thể
    }

    const request = context.switchToHttp().getRequest() as AuthRequest;
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng');
    }

    const userRoleLevel = this.roleHierarchy[user.role];
    const hasAccess = requiredRoles.some(
      (role) => userRoleLevel >= this.roleHierarchy[role],
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Bạn cần quyền ${requiredRoles.join(' hoặc ')} để truy cập tài nguyên này`,
      );
    }

    return true;
  }
}
