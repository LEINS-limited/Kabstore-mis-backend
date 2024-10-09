import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Customer } from "./customers.entity";
import { SaleItem } from "./saleItem.entity";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ESaleStatus } from "src/common/Enum/ESaleStatus.entity";

@Entity('sales')
export class Sale extends BaseEntity {

  @ManyToOne(() => Customer, (Customer) => Customer.sales, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SaleItem, (SaleItem) => SaleItem.sale, { eager: true })
  saleItems: SaleItem[];

  @Column({ default: 0 })
  amountDue: number;

  @Column({nullable:false})
  code: string;

  @Column()
  saleDate: Date;

  @Column()
  status: ESaleStatus;

  @Column()
  paymentType: EPaymentType;

  constructor(
    customer: Customer,
    amountDue: number, 
    saleDate: Date,
    status: number,
    paymentType: EPaymentType
  ) {
    super();
    this.amountDue = amountDue;
    this.saleDate = saleDate;
    this.status = status;
    this.paymentType = paymentType;
    this.customer = customer;
  }
}
