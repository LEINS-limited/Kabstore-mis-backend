import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/entities/sales.entity';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { SaleItem } from 'src/entities/saleItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), TypeOrmModule.forFeature([SaleItem]), CustomersModule, ProductsModule],
  controllers: [SalesController],
  providers: [SalesService]
})
export class SalesModule {}
