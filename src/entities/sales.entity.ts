import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Category } from "./categories.entity";
import { Customer } from "./customers.entity";

@Entity('sales')
export class Sale extends BaseEntity {
  @Column({unique:true})
  name: string;

  @Column({nullable:true})
  code: string;

  @Column()
  sellingPrice: number;

  @Column()
  costPrice: number;

  @Column({default:0})
  quantity: number;

  @ManyToOne(() => Customer, (Customer) => Customer.sales, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Category, (Category) => Category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({default:0})
  safetyStock: number;

  @Column({default:0})
  discountValue: number;

  @Column({nullable:true})
  expiryDate: Date;

  @Column()
  status: EProductStatus;

  constructor(
    name: string,
    sellingPrice: number,
    costPrice: number,
    quantity: number,
    customer: Customer,
    safetyStock: number,
    discountValue: number,
  ) {
    super();
    this.name = name;
    this.sellingPrice = sellingPrice;
    this.costPrice = costPrice;
    this.quantity = quantity;
    this.customer = customer;
    this.safetyStock = safetyStock;
    this.discountValue = discountValue;
  }
}
