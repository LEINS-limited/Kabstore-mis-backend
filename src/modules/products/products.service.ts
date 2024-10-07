import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from 'src/entities/products.entity';
import {
  CreateProductDTO,
  UpdateProductDto,
  UpdateVendorDTO,
} from './dtos/product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';
import { generateCode } from 'src/utils/generator';
import { UUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) public productRepository: Repository<Product>,
    private categoryService: CategoriesService,
    private vendorService: VendorsService,
  ) {}
  async getProducts(): Promise<Product[]> {
    const response = await this.productRepository.find();
    return response;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async existsByName(name:string): Promise<Boolean>{
    let exists = await this.productRepository.exist({where:{name}});
    return exists;
  }
  async create(createProductDto: CreateProductDTO): Promise<Product> {
    if(this.existsByName(createProductDto.name)){
      throw new BadRequestException(`Product with name ${createProductDto.name} already exists!`);
    }
    let category = await this.categoryService.getCategoryById(
      createProductDto.categoryId,
    );
    let vendor = null;

    if (createProductDto.vendorId != '') {
      vendor = await this.vendorService.getVendorById(
        createProductDto.vendorId,
      );
    } else {
      vendor = await this.vendorService.create(createProductDto.vendor);
    }
    const newProduct = this.productRepository.create({
      ...createProductDto,
      vendor: vendor,
      category: category,
      code: generateCode(),
    });

    return await this.productRepository.save(newProduct);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    let category = await this.categoryService.getCategoryById(
      updateProductDto.categoryId,
    );

    product.category = category;
    return this.productRepository.save(product);
  }

  async updateVendor(
    id: string,
    updateVendorDto: UpdateVendorDTO,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    let vendor = null;

    if (updateVendorDto.vendorId != '') {
      vendor = await this.vendorService.getVendorById(updateVendorDto.vendorId);
    } else {
      vendor = await this.vendorService.create(updateVendorDto.vendor);
    }
    product.vendor = vendor;
    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
