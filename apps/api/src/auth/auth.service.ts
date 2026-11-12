import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../common/types/auth-user';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  birthDate: string | null;
  phoneNumber: string | null;
  linkImg: string | null;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          passwordHash,
        },
      });

      return this.issueTokens(user);
    } catch (error) {
      this.rethrowUniqueError(error);
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: { sub: number };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: number }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return toPublicUser(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<PublicUser> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.username !== undefined) data.username = dto.username;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phoneNumber !== undefined) data.phoneNumber = dto.phoneNumber;
    if (dto.birthDate !== undefined) data.birthDate = new Date(`${dto.birthDate}T00:00:00.000Z`);

    try {
      const user = await this.prisma.user.update({ where: { id: userId }, data });
      return toPublicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Пользователь не найден');
      }
      this.rethrowUniqueError(error);
    }
  }

  async deleteAccount(userId: number): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id: userId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Пользователь не найден');
      }
      throw error;
    }
  }

  private async issueTokens(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshExpiresIn as SignOptions['expiresIn'],
        },
      ),
    ]);

    return { accessToken, refreshToken, user: toPublicUser(user) };
  }

  private rethrowUniqueError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    throw error;
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
    phoneNumber: user.phoneNumber,
    linkImg: user.linkImg,
    isAdmin: user.isAdmin,
  };
}
