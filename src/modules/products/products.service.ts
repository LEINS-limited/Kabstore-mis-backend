import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from 'src/entities/products.entity';
import { CreateProductDTO, UpdateProductDto } from './dtos/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) public productRepository: Repository<Product>,
    private categoryService : CategoriesService,
    private cloudinary : CloudinaryService,
    private vendorService : VendorsService
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
    let category = null;
    let vendor = null;
    if(createProductDto.categoryId){
      category = this.categoryService.getCategoryById(createProductDto.categoryId);
    }else{
      category = this.categoryService.create(createProductDto.category);
    }
    if (createProductDto.vendorId) {
      vendor = this.vendorService.getVendorById(
        createProductDto.vendorId,
      );
    }else{
      vendor = this.vendorService.create(createProductDto.vendor);
    }

    const newProduct = this.productRepository.create({...createProductDto, vendors : [vendor], categories:[category]});
    // const pictureUrl = await this.cloudinary.uploadImage(createProductDto.picture).catch(() => {
    //   throw new BadRequestException('Invalid file type.');
    // });
    // console.log(pictureUrl);
    return await this.productRepository.save(newProduct);
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
