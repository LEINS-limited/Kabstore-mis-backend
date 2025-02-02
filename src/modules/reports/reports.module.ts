import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Sale } from 'src/entities/sales.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { Customer } from 'src/entities/customers.entity';
import { Expense } from 'src/entities/expense.entity';
import { ProductsModule } from '../products/products.module';
import { Product } from 'src/entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Customer, Product, Expense]), ProductsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
