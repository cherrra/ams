import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh-токен, полученный при входе' })
  @IsString()
  refreshToken!: string;
}
