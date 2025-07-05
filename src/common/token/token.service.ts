import { Injectable } from '@nestjs/common';
import { DecodeAuthTokenDTO } from './dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async decodeAuthToken(dto: DecodeAuthTokenDTO) {
    const secret = this._getSecretKey();
    const token = this.jwtService.sign(dto, { expiresIn: '24h', secret });
    await this._resetSessionsByUserId(dto.userId);
    await this._createSession(dto.userId, token);
    return token;
  }

  verifyToken(token: string): DecodeAuthTokenDTO {
    if (!token || typeof token !== 'string') {
      throw new Error('Token phải là một chuỗi hợp lệ');
    }

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      throw new Error('Token không thể để trống');
    }

    const secret = this._getSecretKey();
    if (!secret) {
      throw new Error('Khóa bí mật JWT chưa được cấu hình');
    }

    return this.jwtService.verify(trimmedToken, { secret });
  }

  generateVerificationToken() {
    return randomBytes(10).toString('hex');
  }

  private _createSession(userId: number, token: string) {
    return this.prismaService.userSession.create({ data: { token, userId } });
  }

  private _resetSessionsByUserId(userId: number) {
    return this.prismaService.userSession.deleteMany({ where: { userId } });
  }

  private _getSecretKey() {
    return this.configService.get('TOKEN_SECRET_KEY');
  }
}
