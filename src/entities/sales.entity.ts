import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Customer } from "./customers.entity";
import { SaleItem } from "./saleItem.entity";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ESaleStatus } from "src/common/Enum/ESaleStatus.entity";
import { IpasiProductDTO } from "src/common/dtos/ipasi-product.dto";
import { Installment } from "./installment.entity";
import { User } from "./user.entity";

@Entity('sales')
export class Sale extends BaseEntity {

  @ManyToOne(() => Customer, (Customer) => Customer.sales, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => SaleItem, (SaleItem) => SaleItem.sale, { eager: true })
  saleItems: SaleItem[];

  @Column('float',{ default: 0 })
  amountDue: number;

  @Column({nullable:false})
  code: string;

  @Column()
  saleDate: Date;

  @Column({enum:ESaleStatus})
  status: ESaleStatus;

  @Column({enum: EPaymentType})
  paymentType: EPaymentType;

  @Column('float',{default:0})
  totalPrice: number;

  @ManyToOne(() => User, (User) => User.sales, { eager: true })
  @JoinColumn({ name: 'done_by' })
  doneBy: User;

  @Column('jsonb', {nullable:true})
  ipasiProducts: IpasiProductDTO[];

  @OneToMany(() => Installment, (installment) => installment.sale, {eager:true})
  installments: Installment[];

  constructor(
    customer: Customer,
    amountDue: number, 
    saleDate: Date,
    status: ESaleStatus,
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
