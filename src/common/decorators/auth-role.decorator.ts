import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AccessTokenGuard, RoleGuard } from 'src/auth/guards';
import { Roles } from './roles.decorator';

export const AuthRoles = (...roles: UserRole[]) => {
  return applyDecorators(
    UseGuards(AccessTokenGuard, RoleGuard),
    Roles(...roles),
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing authentication token',
    }),
    ApiForbiddenResponse({
      description: 'Forbidden - User does not have required role(s)',
    }),
  );
};

export const SuperAdminOnly = () => AuthRoles(UserRole.SUPER_ADMIN);

export const AdminOnly = () => AuthRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

export const AllRoles = () =>
  AuthRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER);
