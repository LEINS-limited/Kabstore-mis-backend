import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Sale } from 'src/entities/sales.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { Customer } from 'src/entities/customers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Customer])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
