/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief User entity
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  TableInheritance,
  ManyToMany,
  JoinTable,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import { EGender } from '../common/Enum/EGender.enum';
import { EAccountStatus } from '../common/Enum/EAccountStatus.enum';
import { Role } from 'src/entities/role.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { UUID } from 'crypto';
import { ERole } from 'src/common/Enum/ERole.enum';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends BaseEntity {
  @Column()
  fullNames: string;

  @Column()
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role)
  @JoinColumn()
  role: Role;
}
