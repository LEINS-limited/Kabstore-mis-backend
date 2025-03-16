import {  Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Product } from "./products.entity";
import { Sale } from "./sales.entity";
import { BaseEntity } from "src/db/base-entity";

@Entity()
export class SaleItem extends BaseEntity {

  @ManyToOne(() => Product,(Product )=>Product.saleItems, {eager:true })
  @JoinColumn({name: "product_id"})
  product: Product;

  @Column({default:1})
  quantity: number;

  @ManyToOne(() => Sale, (Sale) => Sale.saleItems)
  sale: Sale;

  @Column('float',{default:0})
  total: number;

  @Column('float',{default:0})
  customSellingPrice  :  number;

  @Column('boolean', {default : false})
  sellingOnCustomPrice : boolean;

  constructor(
    quantity: number,
    sale: Sale,
    product: Product
  ) {
    super();
    this.quantity = quantity;
    this.sale = sale;
    this.product = product;
  }
}