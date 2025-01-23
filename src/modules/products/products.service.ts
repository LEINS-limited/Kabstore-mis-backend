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
import {  Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';
import { generateCode } from 'src/utils/generator';
import { paginator } from 'src/utils/paginator';
import { EProductStatus } from 'src/common/Enum/EProductStatus.enum';
import { saveObject } from 'src/utils/algolia';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) public productRepository: Repository<Product>,
    private categoryService: CategoriesService,
    private vendorService: VendorsService
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

  async productsStats(): Promise<any> {
    const totalCount = await this.productRepository.count();
    const outOfStockCount = await this.productRepository.count({
      where: { quantity: 0 },
    });
    const draft = await this.productRepository.count({
      where: { status: EProductStatus.DRAFT },
    });
    const published = await this.productRepository.count({
      where: { status: EProductStatus.PUBLISHED },
    });

    const lowStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.quantity < product.safetyStock')
      .getCount();

    return { totalCount, outOfStockCount, lowStockCount, draft, published };
  }

  async countOutOfStockProducts(): Promise<number> {
    const number = await this.productRepository.count({
      where: {
        quantity: 0,
      },
    });
    return number;
  }

  async getProductsPaginated(page: number, limit: number, search?: string) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.vendor', 'vendor');

    if (search) {
      query.where('product.name ILIKE :search OR product.code ILIKE :search', {
        search: `%${search}%`, // This ensures partial matches for both name and code
      });
    }

    const [products, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { products, meta };
  }

  async existsByName(name: string): Promise<Boolean> {
    let exists = await this.productRepository.exist({ where: { name } });

    return exists;
  }
  async create(createProductDto: CreateProductDTO): Promise<Product> {
    if (await this.existsByName(createProductDto.name)) {
      throw new BadRequestException(
        `Product with name ${createProductDto.name} already exists!`,
      );
    }
    let category = await this.categoryService.getCategoryById(createProductDto.categoryId);
   
    let vendor = null;

    let costPrice = createProductDto.initialPrice + createProductDto.shippingCost + createProductDto.additionalExpenses;

    let taxAmount  = (costPrice * 18)/100;

    let profitPercentage = (createProductDto.sellingPrice - costPrice) * 100 / costPrice;

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
      costPrice : costPrice,
      taxAmount : createProductDto.taxable ? taxAmount : 0,
      code: generateCode('P'),
      profitPercentage : profitPercentage
    });

    // saveObject(newProduct);

    return await this.productRepository.save(newProduct);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    let category = await this.categoryService.getCategoryById(updateProductDto.categoryId)
   
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
