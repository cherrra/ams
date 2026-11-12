import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@ams/shared';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  carId!: number;

  @ApiProperty({ example: '2026-11-05' })
  @IsDateString({}, { message: 'Дата должна быть в формате YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ example: '10:30', description: 'Рабочие часы 09:00–20:00, шаг 30 минут' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Время должно быть в формате HH:MM' })
  time!: string;

  @ApiProperty({ example: [1, 4], type: [Number] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Выберите хотя бы одну услугу' })
  @Type(() => Number)
  @IsInt({ each: true })
  serviceIds!: number[];

  @ApiPropertyOptional({ example: 'Прошу проверить тормоза' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.Accepted })
  @IsEnum(OrderStatus, { message: 'Недопустимый статус' })
  status!: OrderStatus;
}

export class FindOrdersQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class FindAdminOrdersQueryDto extends FindOrdersQueryDto {
  @ApiPropertyOptional({ description: 'Поиск по имени, email или номеру авто' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ example: '2026-11-05' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
