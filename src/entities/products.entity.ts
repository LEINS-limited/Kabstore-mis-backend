import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Vendor } from "./vendors.entity";
import { Category } from "./categories.entity";
import { SaleItem } from "./saleItem.entity";

@Entity('products')
export class Product extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column('float', { default: 0 })
  sellingPrice: number;

  @Column('float', { default: 0 })
  additionalExpenses: number;

  @Column('float', { default: 0 })
  profitPercentage: number;

  @Column('float', { default: 0 })
  initialPrice: number;

  @Column('float', { default: 0 })
  costPrice: number;

  @Column('float', { default: 0 })
  shippingCost: number;

  @Column('float', { default: 0 })
  taxAmount: number;

  @Column({ default: false })
  taxable: boolean;

  @Column({ default: 0 })
  quantity: number;

  @ManyToOne(() => Vendor, (Vendor) => Vendor.products, { eager: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Category, (Category) => Category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ default: 0 })
  safetyStock: number;

  @Column({ default: 0 })
  discountValue: number;

  @Column({ nullable: true })
  dateAdded: Date;

  @Column()
  status: EProductStatus;

  @OneToMany(() => SaleItem, (SaleItem) => SaleItem.product, { eager: false })
  saleItems: SaleItem[];

  constructor(
    name: string,
    sellingPrice: number,
    costPrice: number,
    quantity: number,
    vendor: Vendor,
    safetyStock: number,
    discountValue: number,
  ) {
    super();
    this.name = name;
    this.sellingPrice = sellingPrice;
    this.costPrice = costPrice;
    this.quantity = quantity;
    this.vendor = vendor;
    this.safetyStock = safetyStock;
    this.discountValue = discountValue;
  }
}
