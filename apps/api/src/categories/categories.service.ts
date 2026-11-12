import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

export interface CategoryDto {
  id: number;
  categoryName: string;
  servicesCount?: number;
}

export function toCategoryDto(
  category: Category & { _count?: { services: number } },
): CategoryDto {
  return {
    id: category.idCategory,
    categoryName: category.categoryName,
    ...(category._count ? { servicesCount: category._count.services } : {}),
  };
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { categoryName: 'asc' },
      include: { _count: { select: { services: true } } },
    });

    return categories.map(toCategoryDto);
  }

  async findOne(id: number): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({
      where: { idCategory: id },
      include: { _count: { select: { services: true } } },
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return toCategoryDto(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = await this.prisma.category.create({
      data: { categoryName: dto.categoryName.trim() },
    });

    return toCategoryDto(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryDto> {
    try {
      const category = await this.prisma.category.update({
        where: { idCategory: id },
        data: { categoryName: dto.categoryName.trim() },
      });

      return toCategoryDto(category);
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.category.delete({ where: { idCategory: id } });
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  private rethrowNotFound(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException('Категория не найдена');
    }
    throw error;
  }
}
