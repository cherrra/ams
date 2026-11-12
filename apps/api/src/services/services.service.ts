import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/format';
import {
  CreateServiceDto,
  FindServicesQueryDto,
  UpdateServiceDto,
} from './dto/service.dto';

type ServiceWithCategory = Service & {
  category: { idCategory: number; categoryName: string };
};

export interface ServiceDto {
  id: number;
  serviceName: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
}

function toServiceDto(service: ServiceWithCategory): ServiceDto {
  return {
    id: service.idService,
    serviceName: service.serviceName,
    description: service.description,
    price: toNumber(service.price),
    categoryId: service.categoryId,
    categoryName: service.category.categoryName,
  };
}

const includeCategory = { category: true } as const;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindServicesQueryDto): Promise<ServiceDto[]> {
    const where: Prisma.ServiceWhereInput = {};

    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.serviceName = { contains: query.search };
    }

    const services = await this.prisma.service.findMany({
      where,
      include: includeCategory,
      orderBy: { serviceName: 'asc' },
    });

    return services.map(toServiceDto);
  }

  async findOne(id: number): Promise<ServiceDto> {
    const service = await this.prisma.service.findUnique({
      where: { idService: id },
      include: includeCategory,
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    return toServiceDto(service);
  }

  async create(dto: CreateServiceDto): Promise<ServiceDto> {
    await this.assertCategoryExists(dto.categoryId);

    const service = await this.prisma.service.create({
      data: {
        serviceName: dto.serviceName.trim(),
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        categoryId: dto.categoryId,
      },
      include: includeCategory,
    });

    return toServiceDto(service);
  }

  async update(id: number, dto: UpdateServiceDto): Promise<ServiceDto> {
    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const data: Prisma.ServiceUpdateInput = {};

    if (dto.serviceName !== undefined) data.serviceName = dto.serviceName.trim();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.categoryId !== undefined) data.category = { connect: { idCategory: dto.categoryId } };

    try {
      const service = await this.prisma.service.update({
        where: { idService: id },
        data,
        include: includeCategory,
      });

      return toServiceDto(service);
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.service.delete({ where: { idService: id } });
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { idCategory: categoryId },
      select: { idCategory: true },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
  }

  private rethrowNotFound(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException('Услуга не найдена');
    }
    throw error;
  }
}
