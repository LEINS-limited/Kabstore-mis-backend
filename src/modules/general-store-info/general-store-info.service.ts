import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralStoreInfo } from '../../entities/general-store-info.entity';
import { CreateGeneralStoreInfoDto, UpdateGeneralStoreInfoDto } from '../../common/dtos/general-store-info.dto';

@Injectable()
export class GeneralStoreInfoService {
  constructor(
    @InjectRepository(GeneralStoreInfo)
    private readonly generalStoreInfoRepository: Repository<GeneralStoreInfo>,
  ) {}

  async create(createDto: CreateGeneralStoreInfoDto): Promise<GeneralStoreInfo> {
    if((await this.generalStoreInfoRepository.find()).length > 0){
      throw new BadRequestException('Record already exists');
    }
    const generalStoreInfo = this.generalStoreInfoRepository.create(createDto);
    return await this.generalStoreInfoRepository.save(generalStoreInfo);
  }

  async findAll(): Promise<GeneralStoreInfo[]> {
    return await this.generalStoreInfoRepository.find();
  }

  async findOne(id: string): Promise<GeneralStoreInfo> {
    const generalStoreInfo = await this.generalStoreInfoRepository.find();
    if (!generalStoreInfo) {
      throw new NotFoundException(`General store info record does not exist`);
    }
    return generalStoreInfo[0];
  }

  async update(id: string, updateDto: UpdateGeneralStoreInfoDto): Promise<GeneralStoreInfo> {
    const generalStoreInfo = await this.findAll();
    Object.assign(generalStoreInfo[0], updateDto);
    return await this.generalStoreInfoRepository.save(generalStoreInfo[0]);
  }

  async remove(id: string): Promise<void> {
    const result = await this.generalStoreInfoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`General store info with ID ${id} not found`);
    }
  }
} 