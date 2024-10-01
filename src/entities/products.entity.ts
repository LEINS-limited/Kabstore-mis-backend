import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToMany } from "typeorm";
import { Vendor } from "./vendors.entity";

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  sellingPrice: number;

  @Column()
  costPrice: number;

  @Column()
  quantity: number;

  @ManyToMany(() => Vendor, (Vendor) => Vendor.products, { eager: true })
  @JoinColumn({ name: 'vendor_id' })
  vendors: Vendor[];

  @Column()
  safetyStock: number;

  @Column()
  hasDiscount: boolean;

  @Column()
  discountType: EDiscountType;

  @Column()
  discountValue: number;

  @Column()
  expiryDate: Date;

  @Column()
  status: EProductStatus;

  constructor(
    name: string,
    category: string,
    sellingPrice: number,
    costPrice: number,
    quantity: number,
    vendors: Vendor[],
    safetyStock: number,
    hasDiscount: boolean,
    discountValue: number,
    discountType: EDiscountType,
  ) {
    super();
    this.name = name;
    this.category = category;
    this.sellingPrice = sellingPrice;
    this.costPrice = costPrice;
    this.quantity = quantity;
    this.vendors = vendors;
    this.safetyStock = safetyStock;
    this.hasDiscount = hasDiscount;
    this.discountValue = discountValue;
    this.discountType = discountType;
  }
}
