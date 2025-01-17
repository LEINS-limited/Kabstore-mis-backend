import { BaseEntity } from "src/db/base-entity";

import { Entity } from "typeorm";

import { Column } from "typeorm";

@Entity('general_store_info')
export class GeneralStoreInfo extends BaseEntity {
  @Column('decimal', { precision: 5, scale: 2 })
  generalProfitPercentage: number;

  @Column({ default: 'RWF' })
  baseCurrency: string;

  @Column('decimal', { precision: 10, scale: 2 })
  toUSD: number;

  @Column('decimal', { precision: 10, scale: 2 })
  toDirham: number;
} 