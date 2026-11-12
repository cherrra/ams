import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(72)
  password!: string;
}
