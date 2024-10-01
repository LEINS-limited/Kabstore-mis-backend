import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { Product } from './products.entity';

@Entity('vendors')
export class Vendor extends BaseEntity {
  @Column()
  name: string;

  @Column()
  contactNumber: string;

  @Column()
  location: string;

  @ManyToMany(() => Product, (Product) => Product.vendors)
  @JoinTable()
  @JoinColumn({ name: 'product_id' })
  products: Product[];

  constructor(name: string, contactNumber: string, location: string) {
    super();
    this.name = name;
    this.contactNumber = contactNumber;
    this.location = location;
  }
}
