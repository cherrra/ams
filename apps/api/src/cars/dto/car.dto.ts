import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty({ message: 'Марка обязательна' })
  @MaxLength(255)
  brandName!: string;

  @ApiProperty({ example: 'Camry' })
  @IsString()
  @IsNotEmpty({ message: 'Модель обязательна' })
  @MaxLength(255)
  modelName!: string;

  @ApiProperty({ example: 2012 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year!: number;

  @ApiProperty({ example: 120000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage!: number;

  @ApiPropertyOptional({ example: 'JT12345678901234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  vinCode?: string;

  @ApiPropertyOptional({ example: 'А123АА 177' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  licensePlate?: string;
}

export class UpdateCarDto {
  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  brandName?: string;

  @ApiPropertyOptional({ example: 'Camry' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  modelName?: string;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR + 1)
  year?: number;

  @ApiPropertyOptional({ example: 90000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ example: 'JT12345678901234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  vinCode?: string;

  @ApiPropertyOptional({ example: 'А123АА 177' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  licensePlate?: string;
}

export class BrandDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Toyota' })
  brandName!: string;

  @ApiProperty({ example: ['Camry', 'Mark 2'] })
  models!: string[];
}
