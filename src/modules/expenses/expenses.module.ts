import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';

@Module({
  imports :  [TypeOrmModule.forFeature([Expense])],
  providers: [ExpensesService],
  controllers: [ExpensesController]
})
export class ExpensesModule {}
