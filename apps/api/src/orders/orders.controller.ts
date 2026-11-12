import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderStatus } from '@ams/shared';
import { OrdersService, type OrderDto } from './orders.service';
import {
  CreateOrderDto,
  FindAdminOrdersQueryDto,
  FindOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('booked-slots')
  @ApiOperation({ summary: 'Занятые слоты на дату' })
  @ApiQuery({ name: 'date', example: '2026-11-05' })
  async bookedSlots(
    @Query('date') date: string,
  ): Promise<{ date: string; booked: string[]; total: number; free: number }> {
    const booked = await this.ordersService.getBookedSlots(date);
    const summary = await this.ordersService.getWorkingDaySummary(date);

    return { date, booked, total: summary.total, free: summary.free };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Все заказы с поиском и фильтрами (админ)' })
  findAllAdmin(@Query() query: FindAdminOrdersQueryDto): Promise<OrderDto[]> {
    return this.ordersService.findAdmin(query);
  }

  @Get()
  @ApiOperation({ summary: 'Мои заказы' })
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: FindOrdersQueryDto,
  ): Promise<OrderDto[]> {
    return this.ordersService.findMine(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Заказ по идентификатору' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    return this.ordersService.findOne(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать заказ' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDto> {
    return this.ordersService.create(user.id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Сменить статус заказа (админ)' })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(user, id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить свой заказ' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(user, id, { status: OrderStatus.Canceled });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить заказ (свой до принятия или админ)' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.ordersService.remove(user, id);
  }
}
