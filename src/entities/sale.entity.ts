import { PaymentMethod, SaleStatus, SaleType } from "src/common/enums";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { SaleItem } from "./saleItem.entity";
import { IpasiProduct } from "./ipasiProduct.entity";
import { Customer } from "./customer.entity";

@Entity('sales')
export class Sale extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SaleType,
    default: SaleType.NORMAL
  })
  type: SaleType;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  saleTimestamp: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.FULLY_PAID
  })
  saleStatus: SaleStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amountDue: number;

  @OneToMany(() => SaleItem, item => item.sale, { cascade: true })
  items: SaleItem[];

  @OneToMany(() => IpasiProduct, item => item.sale, { cascade: true })
  ipasiItems: IpasiProduct[];
} 