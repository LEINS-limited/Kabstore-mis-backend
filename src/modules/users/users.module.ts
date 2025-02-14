/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief file for user module
 */
import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from 'src/utils/utils.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RoleModule } from '../roles/role.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sale } from 'src/entities/sales.entity';
import { SalesModule } from '../sales/sales.module';
@Global()
@Module({
  controllers: [UsersController],
  
  imports: [
    TypeOrmModule.forFeature([User, Sale]),
    RoleModule,
    SalesModule,
    UtilsModule,
  ],
  providers: [UsersService,JwtService],
  exports: [UsersService],
})
export class UsersModule {}
// {provide:APP_GUARD, useClass:RolesGuard}
