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

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 1,
} as const;

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as AuthRequest;
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng');
    }

    if (!user.role || !ROLE_HIERARCHY[user.role]) {
      throw new ForbiddenException('Người dùng không có quyền hợp lệ');
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role];
    const hasAccess = requiredRoles.some(
      (requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole],
    );

    if (!hasAccess) {
      const requiredRolesText =
        requiredRoles.length === 1
          ? requiredRoles[0]
          : `${requiredRoles.slice(0, -1).join(', ')} hoặc ${requiredRoles[requiredRoles.length - 1]}`;

      throw new ForbiddenException(
        `Bạn cần quyền ${requiredRolesText} để truy cập tài nguyên này`,
      );
    }

    return true;
  }
}
