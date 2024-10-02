import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from 'src/entities/vendors.entity';
import { CreateVendorDTO } from './dtos/vendors.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) public vendorRepository: Repository<Vendor>,
  ) {}
  async getVendors(): Promise<Vendor[]> {
    const response = await this.vendorRepository.find();
    return response;
  }

  async getVendorById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async create(createVendorDto: CreateVendorDTO): Promise<Vendor> {
    const newVendor = this.vendorRepository.create(createVendorDto);
    return this.vendorRepository.save(newVendor);
  }

  async update(
    id: string,
    updateVendorDto: Partial<CreateVendorDTO>,
  ): Promise<Vendor> {
    const vendor = await this.getVendorById(id);
    Object.assign(vendor, updateVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async delete(id: number): Promise<void> {
    const result = await this.vendorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
