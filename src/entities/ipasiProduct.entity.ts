import { Entity, JoinColumn, ManyToOne } from "typeorm";

import { Column } from "typeorm";
import { Sale } from "./sale.entity";
import { BaseEntity } from "src/db/base-entity";

@Entity('ipasi_products')
export class IpasiProduct extends BaseEntity {
  @ManyToOne(() => Sale)
  @JoinColumn()
  sale: Sale;

  @Column()
  productName: string;

  @Column('int')
  quantitySold: number;

  @Column('decimal', { precision: 10, scale: 2 })
  initialPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sellingPrice: number;
} 