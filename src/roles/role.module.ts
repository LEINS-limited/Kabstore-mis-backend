/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief module for role queries
 */
import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [RoleService],
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => UsersModule)],
  exports: [RoleService],
})
export class RoleModule {}
