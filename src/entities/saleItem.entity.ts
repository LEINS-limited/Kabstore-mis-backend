import {  Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Product } from "./products.entity";
import { Sale } from "./sales.entity";
import { BaseEntity } from "src/db/base-entity";

@Entity()
export class SaleItem extends BaseEntity {
  @OneToOne(() => Product)
  product: Product;

  @Column({default:1})
  quantity: number;

  @ManyToOne(() => Sale, (Sale) => Sale.saleItems)
  sale: Sale;

  @Column({default:0})
  total: number;

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