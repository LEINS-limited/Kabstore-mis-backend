import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/entities/customers.entity';
import { CreateCustomerDTO } from './dtos/customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) public customerRepository: Repository<Customer>,
  ) {}
  async getCustomers(): Promise<Customer[]> {
    try{
    const response = await this.customerRepository.find();
    return response;
    }catch(error){
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try{
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }catch(error){
    throw error;
  }
  }

  async getCustomerCount(): Promise<number>{
    try {
      const total = await this.customerRepository.count();
      return total;
    } catch (error) {
      throw error;
    }
  }

  async create(createCustomerDto: CreateCustomerDTO ): Promise<Customer> {
    try {
      const newCustomer = this.customerRepository.create(createCustomerDto);
    return  this.customerRepository.save(newCustomer);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateCustomerDto: Partial<CreateCustomerDTO>,
  ): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async delete(id: string): Promise<void> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
