import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateCode } from 'src/utils/generator';
import { paginator } from 'src/utils/paginator';
import { Sale } from 'src/entities/sales.entity';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { EPaymentType } from 'src/common/Enum/EPaymentType.entity';
import { ESaleStatus } from 'src/common/Enum/ESaleStatus.entity';
import { CreateSaleDTO } from './dto/sale.dto';
import { SaleItem } from 'src/entities/saleItem.entity';
import { Customer } from 'src/entities/customers.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) public saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem) public saleItemRepository: Repository<SaleItem>,
    private customerService: CustomersService,
    private productService: ProductsService,
  ) {}
  async getSales(): Promise<Sale[]> {
    const response = await this.saleRepository.find();
    return response;
  }

  async getSaleById(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    return sale;
  }

  async salesStats(): Promise<any> {
    const totalCount = await this.saleRepository.count();
    const payment_pending = await this.saleRepository.count({
      where: { status: ESaleStatus.PENDING },
    });
    const payment_completed = await this.saleRepository.count({
      where: { status: ESaleStatus.COMPLETED },
    });

    const payment_in_progress = await this.saleRepository.count({
      where: { status: ESaleStatus.IN_PROGRESS },
    });

    const paid_by_cash = await this.saleRepository.count({
      where: { paymentType: EPaymentType.CASH },
    });

    const paid_by_momo = await this.saleRepository.count({
      where: { paymentType: EPaymentType.MOMO },
    });

    const paid_by_bank = await this.saleRepository.count({
      where: { paymentType: EPaymentType.BANK },
    });

    const totalCustomers = await this.customerService.getCustomerCount();

    return {
      totalCount,
      payment_completed,
      payment_in_progress,
      payment_pending,
      paid_by_bank,
      paid_by_cash,
      paid_by_momo,
      totalCustomers
    };
  }

  async getSalesPaginated(page: number, limit: number, search?: string) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product');

    if (search) {
      query.where('sale.status ILIKE :search OR customer.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [sales, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { sales, meta };
  }

  async getSalesByProductPaginated(page: number, limit: number, productId:string) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .where('product.id = :productId', {
        productId: `${productId}`, 
      });

    const [sales, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { sales, meta };
  }

  async create(createSaleDto: CreateSaleDTO): Promise<Sale> {
    let customer: Customer = null;
    let saleItems: SaleItem[] = [];
    let total = 0;

    if (createSaleDto.customerId != '') {
      customer = await this.customerService.getCustomerById(
        createSaleDto.customerId,
      );
    } else {
      customer = await this.customerService.create(createSaleDto.customer);
    }

    if (createSaleDto.saleItems.length == 0) {
      throw new BadRequestException(
        'Please select sale items to create the sale!',
      );
    }
    for (let i = 0; i < createSaleDto.saleItems.length; i++) {
      let product = await this.productService.getProductById(
        createSaleDto.saleItems[i].productId,
      );
      let item = this.saleItemRepository.create({
        product,
        quantity: createSaleDto.saleItems[i].quantity,
      });
      item = await this.saleItemRepository.save(item);
      item.total = item.quantity * item.product.sellingPrice;
      saleItems.push(item);
    }
    for (let i = 0; i < saleItems.length; i++) {
      total += saleItems[i].total;
    }
    const newSale = this.saleRepository.create({
      ...createSaleDto,
      customer: customer,
      code: generateCode('P'),
      saleItems: saleItems,
      totalPrice: total,
    });

    return await this.saleRepository.save(newSale);
  }

  //   async update(
  //     id: string,
  //     updateSaleDto: UpdateSaleDto,
  //   ): Promise<Product> {
  //     const product = await this.getProductById(id);
  //     Object.assign(product, updateProductDto);
  //     let category = await this.categoryService.getCategoryById(
  //       updateProductDto.categoryId,
  //     );

  //     product.category = category;
  //     return this.productRepository.save(product);
  //   }

  //   async updateVendor(
  //     id: string,
  //     updateVendorDto: UpdateVendorDTO,
  //   ): Promise<Product> {
  //     const product = await this.getProductById(id);
  //     let vendor = null;

  //     if (updateVendorDto.vendorId != '') {
  //       vendor = await this.customerService.getVendorById(updateVendorDto.vendorId);
  //     } else {
  //       vendor = await this.customerService.create(updateVendorDto.vendor);
  //     }
  //     product.vendor = vendor;
  //     return this.saleRepository.save(product);
  //   }

  async delete(id: string): Promise<void> {
    const result = await this.saleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  }
}
