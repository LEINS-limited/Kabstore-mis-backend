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
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../roles/role.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  controllers: [UsersController],
  
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('SECRET_KEY'),
            signOptions: {
              expiresIn: '1d',
            },
          }),
          inject: [ConfigService],
        }),
    UtilsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
// {provide:APP_GUARD, useClass:RolesGuard}
