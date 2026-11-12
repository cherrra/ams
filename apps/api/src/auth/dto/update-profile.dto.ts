import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Иван' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '1990-05-17', description: 'ISO 8601 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'Дата должна быть в формате YYYY-MM-DD' })
  birthDate?: string;

  @ApiPropertyOptional({ example: '+79991234567' })
  @IsOptional()
  @Matches(/^\+?\d{10,15}$/, { message: 'Некорректный номер телефона' })
  phoneNumber?: string;
}
