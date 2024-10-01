import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from 'src/entities/products.entity';
import { CreateProductDTO, UpdateProductDto } from './dtos/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) public productRepository: Repository<Product>,
  ) {}
  async getProducts(): Promise<Product[]> {
    const response = await this.productRepository.find({relations: ['products']});
    return response;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDTO): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    return this.productRepository.save(newProduct);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async delete(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
