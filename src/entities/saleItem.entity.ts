import {  Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Product } from "./products.entity";
import { Sale } from "./sales.entity";
import { BaseEntity } from "src/db/base-entity";

@Entity('sale_items')
export class SaleItem extends BaseEntity {
  @ManyToOne(() => Sale)
  @JoinColumn()
  sale: Sale;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column('int')
  quantitySold: number;
}