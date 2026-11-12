import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Двигатель и смазочные материалы' })
  @IsString()
  @IsNotEmpty({ message: 'Название категории обязательно' })
  @MaxLength(255)
  categoryName!: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Двигатель' })
  @IsString()
  @IsNotEmpty({ message: 'Название категории обязательно' })
  @MaxLength(255)
  categoryName!: string;
}
