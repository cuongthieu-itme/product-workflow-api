import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AccessTokenGuard, RoleGuard } from 'src/auth/guards';
import { Roles } from './roles.decorator';

export const AuthRoles = (...roles: UserRole[]) => {
  return applyDecorators(
    UseGuards(AccessTokenGuard, RoleGuard),
    Roles(...roles),
    ApiBearerAuth('JWT-auth'),
  );
};

export const SuperAdminOnly = () => AuthRoles(UserRole.SUPER_ADMIN);

export const AdminOnly = () => AuthRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

export const AllRoles = () =>
  AuthRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER);
