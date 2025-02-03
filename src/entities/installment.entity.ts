import { BaseEntity } from "src/db/base-entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Sale } from "./sales.entity";
import { EInstallmentStatus } from "src/common/Enum/EInstallmentStatus.enum";

@Entity('installments')
export class Installment extends BaseEntity {
  
  @ManyToOne(() => Sale, (sale) => sale.installments, { onDelete: "CASCADE" })
  sale: Sale;

  @Column('float')
  amount: number;

  @Column('float')
  amountPaid: number;

  @Column({nullable: true})
  dueDate: Date;

  @Column({nullable: true})
  paidDate : Date;

  @Column({ enum: EInstallmentStatus, default: EInstallmentStatus.PENDING })
  status: EInstallmentStatus;
}
