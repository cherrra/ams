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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarsService, type CarDto } from './cars.service';
import { BrandDto, CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/types/auth-user';

@ApiTags('cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('brands')
  @ApiOperation({ summary: 'Марки и модели для выбора при добавлении авто' })
  findBrands(): Promise<BrandDto[]> {
    return this.carsService.findBrands();
  }

  @Get()
  @ApiOperation({ summary: 'Мои автомобили' })
  findAll(@CurrentUser() user: AuthUser): Promise<CarDto[]> {
    return this.carsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Автомобиль по идентификатору' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CarDto> {
    return this.carsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить автомобиль' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCarDto,
  ): Promise<CarDto> {
    return this.carsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Изменить автомобиль' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarDto,
  ): Promise<CarDto> {
    return this.carsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить автомобиль' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.carsService.remove(user.id, id);
  }
}
