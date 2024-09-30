import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity } from "typeorm";

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

  @Column()
  vendor: string;

  @Column()
  vendorContactNumber: string;

  @Column()
  vendorLocation: string;

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

  constructor(
    name: string,
    category: string,
    sellingPrice: number,
    costPrice: number,
    quantity: number,
    vendor: string,
    vendorContactNumber: string,
    vendorLocation: string,
    safetyStock: number,
    hasDiscount: boolean,
    discountValue: number,
    discountType: EDiscountType
  ) {
    super();
    this.name = name;
    this.category = category;
    this.sellingPrice = sellingPrice;
    this.costPrice = costPrice;
    this.quantity = quantity;
    this.vendor = vendor;
    this.vendorContactNumber = vendorContactNumber;
    this.vendorLocation = vendorLocation;
    this.safetyStock = safetyStock;
    this.hasDiscount = hasDiscount;
    this.discountValue  =  discountValue;
    this.discountType = discountType;
  }
}
