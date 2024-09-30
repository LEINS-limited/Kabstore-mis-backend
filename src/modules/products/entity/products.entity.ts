import { BaseEntity } from "src/db/base-entity";
import {  Entity } from "typeorm";

@Entity({name: 'product'})
export class Product extends BaseEntity{

}