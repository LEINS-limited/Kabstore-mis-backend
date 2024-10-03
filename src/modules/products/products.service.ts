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
    private categoryService: CategoriesService,
    private cloudinary: CloudinaryService,
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

   async existsByName(name: string): Promise<Boolean> {
    const exists = await this.productRepository.exist({ where: { name : name } });
    return exists;
  }

  async create(
    createProductDto: CreateProductDTO,
    file: Express.Multer.File,
  ): Promise<Product> {
    let category = null;
    let vendor = null;
    let duplicate = await this.existsByName(createProductDto.name);
    if(duplicate){
      throw new BadRequestException(`Product with name ${createProductDto.name} already exists!`)
    }
    if (createProductDto.categoryId != undefined) {
      category = await this.categoryService.getCategoryById(
        createProductDto.categoryId,
      );
    } else {
      category = await this.categoryService.create(
        JSON.parse(createProductDto.category as unknown as string),
      );
    }
    if (createProductDto.vendorId != undefined) {
      vendor = await this.vendorService.getVendorById(
        createProductDto.vendorId,
      );
    } else {
      vendor = await this.vendorService.create(
        JSON.parse(createProductDto.vendor as unknown as string),
      );
    }
    const newProduct = this.productRepository.create({
      ...createProductDto,
      vendors: [vendor],
      categories: [category],
      createdAt: createProductDto.addedDate
    });
    const pictureUrl = await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
    newProduct.pictureUrl = pictureUrl.url;
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

  async delete(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
