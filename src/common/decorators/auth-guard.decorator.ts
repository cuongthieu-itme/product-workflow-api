import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards';

export const AuthGuard = () => {
  return applyDecorators(
    UseGuards(AccessTokenGuard),
    ApiBearerAuth('JWT-auth'),
  );
};
