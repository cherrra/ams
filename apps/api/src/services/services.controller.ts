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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService, type ServiceDto } from './services.service';
import {
  CreateServiceDto,
  FindServicesQueryDto,
  UpdateServiceDto,
} from './dto/service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Список услуг (можно фильтровать по категории)' })
  findAll(@Query() query: FindServicesQueryDto): Promise<ServiceDto[]> {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Услуга по идентификатору' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceDto> {
    return this.servicesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать услугу (админ)' })
  create(@Body() dto: CreateServiceDto): Promise<ServiceDto> {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить услугу (админ)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceDto> {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить услугу (админ)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicesService.remove(id);
  }
}
