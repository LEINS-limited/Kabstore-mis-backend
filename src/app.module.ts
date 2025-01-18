/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief file App module
 */
import { Module, OnModuleInit } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { HomeController } from './home/home.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailingModule } from './integrations/mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { FilesModule } from './integrations/files/files.module';
import { UtilsModule } from './utils/utils.module';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RoleService } from './modules/roles/role.service';
import { RoleModule } from './modules/roles/role.module';
import { ProductsModule } from './modules/products/products.module';
import { Product } from './entities/products.entity';
import { VendorsModule } from './modules/vendors/vendors.module';
import { Vendor } from './entities/vendors.entity';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Category } from './entities/categories.entity';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { Customer } from './entities/customers.entity';
import { Sale } from './entities/sales.entity';
import { SaleItem } from './entities/saleItem.entity';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { Expense } from './entities/expense.entity';
import { ExpenseItem } from './entities/expenseItem.entity';
import { ReportsModule } from './modules/reports/reports.module';
import { GeneralStoreInfoModule } from './modules/general-store-info/general-store-info.module';
import { GeneralStoreInfo } from './entities/general-store-info.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          User,
          Role,
          Product,
          Vendor,
          Category,
          Customer,
          Sale,
          SaleItem,
          Expense,
          ExpenseItem,
          GeneralStoreInfo
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    JwtModule,
    UsersModule,
    RoleModule,
    MailingModule,
    AuthModule,
    FilesModule,
    UtilsModule,
    ProductsModule,
    VendorsModule,
    CloudinaryModule,
    CategoriesModule,
    SalesModule,
    CustomersModule,
    ExpensesModule,
    ReportsModule,
    GeneralStoreInfoModule
  ],
  controllers: [AuthController, HomeController],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {
    let roles = await this.roleService.getAllRoles();
    if (!roles || roles.length == 0) {
      this.roleService.createRoles();
    }
  }
}
