import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus as PrismaOrderStatus, Prisma } from '@prisma/client';
import { isValidSlotTime, ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, OrderStatus } from '@ams/shared';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/format';
import {
  CreateOrderDto,
  FindAdminOrdersQueryDto,
  FindOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';

const orderInclude = {
  car: { include: { model: { include: { brand: true } } } },
  services: { include: { service: true } },
  user: { select: { id: true, username: true, email: true, phoneNumber: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

/**
 * Prisma-клиент использует «имена» значений enum (CREATED), а в БД и в API —
 * строки в нижнем регистре (created). Конвертируем на границе слоя БД.
 */
const STATUS_TO_PRISMA: Record<OrderStatus, PrismaOrderStatus> = {
  [OrderStatus.Created]: PrismaOrderStatus.CREATED,
  [OrderStatus.Accepted]: PrismaOrderStatus.ACCEPTED,
  [OrderStatus.InProgress]: PrismaOrderStatus.IN_PROGRESS,
  [OrderStatus.Completed]: PrismaOrderStatus.COMPLETED,
  [OrderStatus.Finished]: PrismaOrderStatus.FINISHED,
  [OrderStatus.Canceled]: PrismaOrderStatus.CANCELED,
};

const STATUS_FROM_PRISMA: Record<PrismaOrderStatus, OrderStatus> = {
  [PrismaOrderStatus.CREATED]: OrderStatus.Created,
  [PrismaOrderStatus.ACCEPTED]: OrderStatus.Accepted,
  [PrismaOrderStatus.IN_PROGRESS]: OrderStatus.InProgress,
  [PrismaOrderStatus.COMPLETED]: OrderStatus.Completed,
  [PrismaOrderStatus.FINISHED]: OrderStatus.Finished,
  [PrismaOrderStatus.CANCELED]: OrderStatus.Canceled,
};

export interface OrderServiceItemDto {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number;
}

export interface OrderDto {
  id: number;
  status: OrderStatus;
  statusLabel: string;
  date: string;
  time: string;
  totalPrice: number;
  comment: string | null;
  doc: string | null;
  createdAt: string;
  car: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string | null;
  };
  services: OrderServiceItemDto[];
  user: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string | null;
  } | null;
}

function toOrderDto(
  order: OrderWithRelations,
  options: { withUser: boolean },
): OrderDto {
  const status = STATUS_FROM_PRISMA[order.status];

  return {
    id: order.idOrder,
    status,
    statusLabel: ORDER_STATUS_LABELS[status],
    date: order.orderDate,
    time: order.orderTime,
    totalPrice: toNumber(order.totalPrice),
    comment: order.comment,
    doc: order.doc,
    createdAt: order.createdAt.toISOString(),
    car: {
      id: order.car.id,
      brand: order.car.model.brand.brandName,
      model: order.car.model.modelName,
      licensePlate: order.car.licensePlate,
    },
    services: order.services.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      serviceName: item.service.serviceName,
      price: toNumber(item.price),
    })),
    user: options.withUser
      ? {
          id: order.user.id,
          username: order.user.username,
          email: order.user.email,
          phoneNumber: order.user.phoneNumber,
        }
      : null,
  };
}

function slotStart(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto): Promise<OrderDto> {
    if (!isValidSlotTime(dto.time)) {
      throw new BadRequestException(
        'Время должно быть в рабочих часах 09:00–20:00 с шагом 30 минут',
      );
    }

    if (slotStart(dto.date, dto.time).getTime() < Date.now()) {
      throw new BadRequestException('Нельзя записаться на прошедшее время');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const car = await tx.car.findUnique({ where: { id: dto.carId } });
      if (!car) {
        throw new NotFoundException('Автомобиль не найден');
      }
      if (car.userId !== userId) {
        throw new ForbiddenException('Нет доступа к этому автомобилю');
      }

      const services = await tx.service.findMany({
        where: { idService: { in: dto.serviceIds } },
      });

      if (services.length !== new Set(dto.serviceIds).size) {
        throw new NotFoundException('Одна или несколько услуг не найдены');
      }

      const conflict = await tx.order.findFirst({
        where: {
          orderDate: dto.date,
          orderTime: dto.time,
          status: { not: PrismaOrderStatus.CANCELED },
        },
        select: { idOrder: true },
      });

      if (conflict) {
        throw new ConflictException('Это время уже занято, выберите другое');
      }

      const totalPrice = services.reduce((sum, service) => sum + Number(service.price), 0);

      return tx.order.create({
        data: {
          userId,
          carId: dto.carId,
          orderDate: dto.date,
          orderTime: dto.time,
          totalPrice: new Prisma.Decimal(totalPrice),
          comment: dto.comment ?? null,
          services: {
            create: services.map((service) => ({
              serviceId: service.idService,
              price: service.price,
            })),
          },
        },
        include: orderInclude,
      });
    });

    return toOrderDto(order, { withUser: false });
  }

  async findMine(userId: number, query: FindOrdersQueryDto): Promise<OrderDto[]> {
    const where: Prisma.OrderWhereInput = { userId };

    if (query.status) {
      where.status = STATUS_TO_PRISMA[query.status];
    }

    if (query.from || query.to) {
      where.orderDate = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: [{ orderDate: 'desc' }, { orderTime: 'desc' }],
    });

    return orders.map((order) => toOrderDto(order, { withUser: false }));
  }

  async findAdmin(query: FindAdminOrdersQueryDto): Promise<OrderDto[]> {
    const where: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = STATUS_TO_PRISMA[query.status];
    }

    if (query.date) {
      where.orderDate = query.date;
    } else if (query.from || query.to) {
      where.orderDate = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    if (query.search) {
      where.OR = [
        { user: { username: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
        { car: { licensePlate: { contains: query.search } } },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: [{ orderDate: 'desc' }, { orderTime: 'desc' }],
    });

    return orders.map((order) => toOrderDto(order, { withUser: true }));
  }

  async findOne(
    viewer: { id: number; isAdmin: boolean },
    id: number,
  ): Promise<OrderDto> {
    const order = await this.findRawOrder(id);

    if (!viewer.isAdmin && order.userId !== viewer.id) {
      throw new ForbiddenException('Нет доступа к этому заказу');
    }

    return toOrderDto(order, { withUser: viewer.isAdmin });
  }

  async updateStatus(
    viewer: { id: number; isAdmin: boolean },
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderDto> {
    const order = await this.findRawOrder(id);

    if (!viewer.isAdmin) {
      if (order.userId !== viewer.id) {
        throw new ForbiddenException('Нет доступа к этому заказу');
      }
      if (dto.status !== OrderStatus.Canceled) {
        throw new ForbiddenException('Пользователь может только отменить заказ');
      }
    }

    const current = STATUS_FROM_PRISMA[order.status];
    const allowed = ORDER_STATUS_TRANSITIONS[current] ?? [];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Нельзя перевести заказ из статуса «${ORDER_STATUS_LABELS[current]}» в «${ORDER_STATUS_LABELS[dto.status]}»`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { idOrder: id },
      data: { status: STATUS_TO_PRISMA[dto.status] },
      include: orderInclude,
    });

    return toOrderDto(updated, { withUser: viewer.isAdmin });
  }

  async remove(viewer: { id: number; isAdmin: boolean }, id: number): Promise<void> {
    const order = await this.findRawOrder(id);

    if (!viewer.isAdmin) {
      if (order.userId !== viewer.id) {
        throw new ForbiddenException('Нет доступа к этому заказу');
      }
      if (
        order.status !== PrismaOrderStatus.CANCELED &&
        order.status !== PrismaOrderStatus.CREATED
      ) {
        throw new BadRequestException(
          'Удалить можно только отменённый или ещё не принятый заказ',
        );
      }
    }

    await this.prisma.order.delete({ where: { idOrder: id } });
  }

  async getBookedSlots(date: string): Promise<string[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        orderDate: date,
        status: { not: PrismaOrderStatus.CANCELED },
      },
      select: { orderTime: true },
      orderBy: { orderTime: 'asc' },
    });

    return orders.map((order) => order.orderTime);
  }

  async getWorkingDaySummary(date: string): Promise<{
    date: string;
    total: number;
    booked: number;
    free: number;
  }> {
    const booked = await this.getBookedSlots(date);
    const total = ((20 - 9) * 60) / 30;

    return {
      date,
      total,
      booked: booked.length,
      free: Math.max(total - booked.length, 0),
    };
  }

  private async findRawOrder(id: number): Promise<OrderWithRelations> {
    const order = await this.prisma.order.findUnique({
      where: { idOrder: id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }
}
