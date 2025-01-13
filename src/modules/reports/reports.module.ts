import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Sale } from 'src/entities/sales.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
