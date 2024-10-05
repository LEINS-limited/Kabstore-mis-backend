import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany } from 'typeorm';
import { Product } from './products.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Product, (Product) => Product.categories, {cascade:true})
  @JoinTable()
  @JoinColumn({ name: 'product_id' })
  products: Product[];

  @Column({ nullable: true })
  pictureUrl: string;

  constructor(name: string, description: string) {
    super();
    this.name = name;
    this.description = description;
  }
}
