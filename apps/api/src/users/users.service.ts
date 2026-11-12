import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toDateString } from '../common/utils/format';

const userInclude = {
  cars: { include: { model: { include: { brand: true } } } },
  _count: { select: { orders: true } },
} satisfies Prisma.UserInclude;

type UserWithRelations = Prisma.UserGetPayload<{ include: typeof userInclude }>;

export interface AdminUserDto {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: string | null;
  linkImg: string | null;
  isAdmin: boolean;
  createdAt: string;
  ordersCount: number;
  cars: Array<{
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string | null;
  }>;
}

function toAdminUserDto(user: UserWithRelations): AdminUserDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate ? toDateString(user.birthDate) : null,
    linkImg: user.linkImg,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
    ordersCount: user._count.orders,
    cars: user.cars.map((car) => ({
      id: car.id,
      brand: car.model.brand.brandName,
      model: car.model.modelName,
      year: car.year,
      licensePlate: car.licensePlate,
    })),
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string): Promise<AdminUserDto[]> {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { phoneNumber: { contains: search } },
          ],
        }
      : {};

    const users = await this.prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { id: 'asc' },
    });

    return users.map(toAdminUserDto);
  }

  async findOne(id: number): Promise<AdminUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return toAdminUserDto(user);
  }

  async remove(actor: { id: number }, id: number): Promise<void> {
    if (actor.id === id) {
      throw new BadRequestException('Нельзя удалить собственный аккаунт через админку');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (user.isAdmin) {
      throw new ForbiddenException('Нельзя удалить администратора');
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
