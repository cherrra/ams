import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ServicesModule } from './services/services.module';
import { CarsModule } from './cars/cars.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ServicesModule,
    CarsModule,
    OrdersModule,
    UsersModule,
    UploadsModule,
  ],
})
export class AppModule {}
