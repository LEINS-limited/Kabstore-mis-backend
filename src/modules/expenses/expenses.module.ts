import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { ExpenseItem } from 'src/entities/expenseItem.entity';

@Module({
  imports :  [TypeOrmModule.forFeature([Expense, ExpenseItem])],
  providers: [ExpensesService],
  controllers: [ExpensesController]
})
export class ExpensesModule {}
