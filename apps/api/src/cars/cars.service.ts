import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BrandDto, CreateCarDto, UpdateCarDto } from './dto/car.dto';

export interface CarDto {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  vinCode: string | null;
  licensePlate: string | null;
  linkImg: string | null;
  createdAt: string;
}

type CarWithModel = Prisma.CarGetPayload<{
  include: { model: { include: { brand: true } } };
}>;

function toCarDto(car: CarWithModel): CarDto {
  return {
    id: car.id,
    brand: car.model.brand.brandName,
    model: car.model.modelName,
    year: car.year,
    mileage: car.mileage,
    vinCode: car.vinCode,
    licensePlate: car.licensePlate,
    linkImg: car.linkImg,
    createdAt: car.createdAt.toISOString(),
  };
}

type PrismaExecutor = Prisma.TransactionClient | PrismaService;

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number): Promise<CarDto[]> {
    const cars = await this.prisma.car.findMany({
      where: { userId },
      include: { model: { include: { brand: true } } },
      orderBy: { id: 'asc' },
    });

    return cars.map(toCarDto);
  }

  async findOne(userId: number, id: number): Promise<CarDto> {
    const car = await this.findOwnedCar(userId, id);
    return toCarDto(car);
  }

  async create(userId: number, dto: CreateCarDto): Promise<CarDto> {
    const car = await this.prisma.$transaction(async (tx) => {
      const modelId = await this.resolveModel(tx, dto.brandName, dto.modelName);

      return tx.car.create({
        data: {
          userId,
          modelId,
          year: dto.year,
          mileage: dto.mileage,
          vinCode: dto.vinCode || null,
          licensePlate: dto.licensePlate || null,
        },
        include: { model: { include: { brand: true } } },
      });
    });

    return toCarDto(car);
  }

  async update(userId: number, id: number, dto: UpdateCarDto): Promise<CarDto> {
    const current = await this.findOwnedCar(userId, id);

    const car = await this.prisma.$transaction(async (tx) => {
      const data: Prisma.CarUpdateInput = {};

      if (dto.year !== undefined) data.year = dto.year;
      if (dto.mileage !== undefined) data.mileage = dto.mileage;
      if (dto.vinCode !== undefined) data.vinCode = dto.vinCode || null;
      if (dto.licensePlate !== undefined) data.licensePlate = dto.licensePlate || null;

      const brandName = dto.brandName?.trim();
      const modelName = dto.modelName?.trim();

      if (brandName || modelName) {
        const modelId = await this.resolveModel(
          tx,
          brandName ?? current.model.brand.brandName,
          modelName ?? current.model.modelName,
        );
        data.model = { connect: { idModel: modelId } };
      }

      return tx.car.update({
        where: { id },
        data,
        include: { model: { include: { brand: true } } },
      });
    });

    return toCarDto(car);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.findOwnedCar(userId, id);
    await this.prisma.car.delete({ where: { id } });
  }

  async updatePhoto(carId: number, linkImg: string): Promise<CarDto> {
    const car = await this.prisma.car.update({
      where: { id: carId },
      data: { linkImg },
      include: { model: { include: { brand: true } } },
    });

    return toCarDto(car);
  }

  async findBrands(): Promise<BrandDto[]> {
    const brands = await this.prisma.brand.findMany({
      include: { models: { orderBy: { modelName: 'asc' } } },
      orderBy: { brandName: 'asc' },
    });

    return brands.map((brand) => ({
      id: brand.idBrand,
      brandName: brand.brandName,
      models: brand.models.map((model) => model.modelName),
    }));
  }

  private async findOwnedCar(userId: number, id: number): Promise<CarWithModel> {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: { model: { include: { brand: true } } },
    });

    if (!car) {
      throw new NotFoundException('Автомобиль не найден');
    }

    if (car.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому автомобилю');
    }

    return car;
  }

  private async resolveModel(
    tx: PrismaExecutor,
    brandName: string,
    modelName: string,
  ): Promise<number> {
    const brand = await tx.brand.upsert({
      where: { brandName },
      create: { brandName },
      update: {},
    });

    const model = await tx.model.upsert({
      where: { brandId_modelName: { brandId: brand.idBrand, modelName } },
      create: { brandId: brand.idBrand, modelName },
      update: {},
    });

    return model.idModel;
  }
}
