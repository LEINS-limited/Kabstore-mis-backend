/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief Role entity
 */
import { ERole } from 'src/common/Enum/ERole.enum';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';

@Entity('roles')
export class Role extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  role_name: String;
  @ManyToMany(() => User)
  users: User[];
}
