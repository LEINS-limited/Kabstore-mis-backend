import { BaseEntity, Entity, OneToMany, OneToOne } from "typeorm";
import { Product } from "./products.entity";

@Entity()
export class SaleItem extends BaseEntity{
    @OneToOne(()=>Product)
    products: Product
}