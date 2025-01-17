import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { BaseEntity } from "src/db/base-entity";
import {  Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Vendor } from "./vendors.entity";
import { Category } from "./categories.entity";
import { SaleItem } from "./saleItem.entity";

@Entity('products')
export class Product extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column()
  sellingPrice: number;

  @Column()
  costPrice: number;

  @Column()
  shippingCost: number;

  @Column({default: 0})
  taxAmount: number;

  @Column()
  inStock : number;

  @Column({default: false})
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
  expiryDate: Date;

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
