import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import type { JwtPayload } from '../types/auth-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers['authorization'];
    const value = Array.isArray(header) ? header[0] : header;
    const [type, token] = value?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      request.user = {
        id: payload.sub,
        email: payload.email,
        isAdmin: payload.isAdmin,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Неверный или просроченный токен');
    }
  }
}
