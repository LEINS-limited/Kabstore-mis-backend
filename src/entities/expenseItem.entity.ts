import { EExpenseCategory } from "src/common/Enum/EExpenseCategory.enum";
import {  Column, Entity, OneToMany } from "typeorm";
import { Expense } from "./expense.entity";
import { BaseEntity } from "src/db/base-entity";

@Entity('expenseItem')
export class ExpenseItem extends BaseEntity {
  @Column({ default: 0 })
  name: string;

  @Column({ default: 0, enum: EExpenseCategory })
  category: EExpenseCategory;

  @OneToMany(() => Expense, (expense) => expense.expenseItem, { cascade: true })
  expenses: Expense[];

  constructor(name: string, category: EExpenseCategory) {
    super();
    this.name = name;
    this.category = category;
  }
}
