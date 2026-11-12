import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService, type AdminUserDto } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Список пользователей (админ)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string): Promise<AdminUserDto[]> {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Пользователь по идентификатору (админ)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminUserDto> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить пользователя (админ)' })
  async remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usersService.remove(actor, id);
  }
}
