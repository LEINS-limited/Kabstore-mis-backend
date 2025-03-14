import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/products.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { VendorsModule } from '../vendors/vendors.module';
import { CategoriesModule } from '../categories/categories.module';
import { GeneralStoreInfoModule } from '../general-store-info/general-store-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
    VendorsModule,
    CategoriesModule,
    GeneralStoreInfoModule
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
