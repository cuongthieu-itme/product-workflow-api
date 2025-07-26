import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { AuthRequest } from 'src/common/types';

/**
 * Role hierarchy configuration
 * Higher numbers indicate higher privileges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 1,
} as const;

/**
 * Role-based access control guard
 *
 * This guard checks if the authenticated user has the required role(s) to access a route.
 * It supports role hierarchy where higher-level roles can access lower-level resources.
 *
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * async adminOnlyMethod() {
 *   // Only ADMIN and SUPER_ADMIN can access this
 * }
 * ```
 */
@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines if the current user can access the route based on their role
   * @param context - The execution context containing request information
   * @returns true if access is allowed, throws ForbiddenException otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the request and user information
    const request = context.switchToHttp().getRequest() as AuthRequest;
    const user = request.user;

    // Check if user exists in request
    if (!user) {
      this.logger.warn('Role guard: No user found in request');
      throw new ForbiddenException('Không tìm thấy thông tin người dùng');
    }

    // Check if user has a valid role
    if (!user.role || !ROLE_HIERARCHY[user.role]) {
      this.logger.warn(
        `Role guard: Invalid role for user ${user.id}: ${user.role}`,
      );
      throw new ForbiddenException('Người dùng không có quyền hợp lệ');
    }

    // Check if user has sufficient privileges
    const userRoleLevel = ROLE_HIERARCHY[user.role];
    const hasAccess = requiredRoles.some(
      (requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole],
    );

    if (!hasAccess) {
      this.logger.warn(
        `Role guard: Access denied for user ${user.id} (${user.role}) to roles: ${requiredRoles.join(', ')}`,
      );

      const requiredRolesText =
        requiredRoles.length === 1
          ? requiredRoles[0]
          : `${requiredRoles.slice(0, -1).join(', ')} hoặc ${requiredRoles[requiredRoles.length - 1]}`;

      throw new ForbiddenException(
        `Bạn cần quyền ${requiredRolesText} để truy cập tài nguyên này`,
      );
    }

    this.logger.debug(
      `Role guard: Access granted for user ${user.id} (${user.role}) to roles: ${requiredRoles.join(', ')}`,
    );

    return true;
  }
}
