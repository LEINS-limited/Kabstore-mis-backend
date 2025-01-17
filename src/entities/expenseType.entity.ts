import { BaseEntity } from "../db/base-entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Expense } from "./expense.entity";

@Entity('expense_types')
export class ExpenseType extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Expense, expense => expense.expenseType)
  expenses: Expense[];
} 