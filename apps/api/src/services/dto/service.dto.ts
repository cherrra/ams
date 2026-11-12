import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Замена масла в ДВС' })
  @IsString()
  @IsNotEmpty({ message: 'Название услуги обязательно' })
  @MaxLength(255)
  serviceName!: string;

  @ApiProperty({ example: 'Слив отработанного масла и заливка нового.' })
  @IsString()
  @MaxLength(555)
  description!: string;

  @ApiProperty({ example: 2000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Замена масла в ДВС' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  serviceName?: string;

  @ApiPropertyOptional({ example: 'Обновлённое описание.' })
  @IsOptional()
  @IsString()
  @MaxLength(555)
  description?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}

export class FindServicesQueryDto {
  @ApiPropertyOptional({ description: 'Фильтр по категории' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Поиск по названию' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
