import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ExpenseItem } from "./expenseItem.entity";
import { ExpenseStatus } from "src/common/Enum/ExpenseStatus.enum";
import { BaseEntity } from "src/db/base-entity";
import { ExpenseType } from "./expenseType.entity";
import { PaymentMethod } from "src/common/enums/index";

@Entity('expenses')
export class Expense extends BaseEntity {
  @ManyToOne(() => ExpenseType)
  @JoinColumn()
  expenseType: ExpenseType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING
  })
  status: ExpenseStatus;
}
