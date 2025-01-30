import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ExpenseStatus } from "src/common/Enum/ExpenseStatus.enum";
import { BaseEntity } from "src/db/base-entity";

@Entity('expenses')
export class Expense extends BaseEntity {
 
  // @ManyToOne(() => ExpenseItem, (ExpenseItem) => ExpenseItem.expenses, {
  //   eager: true,
  // })
  // @JoinColumn({ name: 'expense_item_id' })
  // expenseItem: ExpenseItem;

  @Column({ nullable: true })
  expenseCategoryOrName: string;

  @Column({ default: 0 })
  amount: number;

  @Column({ nullable: false })
  code: string;

  @Column()
  expenseDate: Date;    

  @Column({ enum: ExpenseStatus })
  status: ExpenseStatus;

  @Column({ enum: EPaymentType })
  paymentType: EPaymentType;


  constructor(
    expenseCategoryOrName: string,
    amount: number,
    expenseDate: Date,
    status: ExpenseStatus,
    paymentType: EPaymentType,
  ) {
    super();
    this.amount = amount;
    this.expenseDate = expenseDate;
    this.status = status;
    this.paymentType = paymentType;
    this.expenseCategoryOrName = expenseCategoryOrName;
  }
}
