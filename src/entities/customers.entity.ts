import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Product } from './products.entity';
import { Sale } from './sales.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  name: string;

  @Column()
  contactNumber: string;

  @OneToMany(() => Sale, (Sale) => Sale.customer, {cascade:true})
  sales: Sale[];

  constructor(name: string, contactNumber: string) {
    super();
    this.name = name;
    this.contactNumber = contactNumber;
  }
}
