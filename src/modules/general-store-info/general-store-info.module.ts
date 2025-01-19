import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralStoreInfoController } from 'src/modules/general-store-info/general-store-info.controller';
import { GeneralStoreInfo } from 'src/entities/general-store-info.entity';
import { GeneralStoreInfoService } from './general-store-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralStoreInfo])],
  controllers: [GeneralStoreInfoController],
  providers: [GeneralStoreInfoService],
  exports: [GeneralStoreInfoService],
})
export class GeneralStoreInfoModule {} 