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
import { Installment } from 'src/entities/installment.entity';
import { EInstallmentStatus } from 'src/common/Enum/EInstallmentStatus.enum';
import { InstallmentDTO, PayInstallmentDTO } from 'src/common/dtos/installement.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) public saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem) public saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Installment) public installmentRepository: Repository<Installment>,
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
    let installments: Installment[] = [];
    let total = 0;

    // Handle customer creation/lookup
    try {
      if (createSaleDto.customerId) {
        customer = await this.customerService.getCustomerById(createSaleDto.customerId);
      } else if (createSaleDto.newCustomer) {
        customer = await this.customerService.create(createSaleDto.newCustomer);
      }
    } catch (error) {
      throw new BadRequestException(`Customer error: ${error.message}`);
    }

    // Validate at least one type of sale items exists
    if ((!createSaleDto.saleItems || createSaleDto.saleItems.length === 0) && 
        (!createSaleDto.ipasiProducts || createSaleDto.ipasiProducts.length === 0)) {
      throw new BadRequestException('Please provide either regular sale items or IPASI items');
    }

    // Handle regular sale items
    if (createSaleDto.saleItems?.length > 0) {
      for (const item of createSaleDto.saleItems) {
        try {
          const product = await this.productService.getProductById(item.productId);
          
          // Check stock availability
          if (product.quantity < item.quantitySold) {
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}. Available: ${product.quantity}`
            );
          }

          // Create sale item
          const saleItem = this.saleItemRepository.create({
            product,
            quantity: item.quantitySold,
            total: item.quantitySold * product.sellingPrice
          });

          saleItems.push(await this.saleItemRepository.save(saleItem));
          total += saleItem.total;

          // Update product quantity
          await this.productService.update(product.id, {
            quantity: product.quantity - item.quantitySold,
            categoryId: product.category.id,
            name: product.name,
            sellingPrice: product.sellingPrice,
            profitPercentage:null,
            costPrice: product.costPrice,
            shippingCost: product.shippingCost,
            taxable: product.taxable,
            additionalExpenses: product.additionalExpenses,
            safetyStock: product.safetyStock,
            addedDate: product.dateAdded,
            status: product.status
          });
        } catch (error) {
          throw new BadRequestException(`Error processing product: ${error.message}`);
        }
      }
    }

    // Handle installments 

    if (createSaleDto.installments?.length > 0) {
      for (const installment of createSaleDto.installments) {
        try {

          // Check stock availability
         

          // Create sale item
          const installmentRecord = this.installmentRepository.create({
           amount: installment.amount,
           amountPaid : installment.amountPaid,
          dueDate: installment.dueDate,
            status: EInstallmentStatus.PENDING,
          });

          installments.push(await this.installmentRepository.save(installmentRecord));

          // Update product quantity
        
        } catch (error) {
          throw new BadRequestException(`Error processing product: ${error.message}`);
        }
      }
    }

    // Handle IPASI products
    const ipasiProducts = createSaleDto.ipasiProducts?.map(item => ({
      productName: item.productName,
      quantitySold: item.quantitySold,
      initialPrice: item.initialPrice,
      sellingPrice: item.sellingPrice
    })) || [];

    // Create the sale
    const newSale = this.saleRepository.create({
      customer,
      saleItems,
      code: generateCode('S'),
      totalPrice: total,
      amountDue: createSaleDto.status === ESaleStatus.CREDITED ? (createSaleDto.amountDue || total) : 0,
      saleDate: new Date(),
      status: createSaleDto.status,
      paymentType: createSaleDto.paymentType,
      ipasiProducts,
      installments
    });

    try {
      return await this.saleRepository.save(newSale);
    } catch (error) {
      // Rollback product quantities if sale fails
      for (const item of saleItems) {
        await this.productService.update(item.product.id, {
          ...item.product,
          quantity: item.product.quantity + item.quantity,
          categoryId: item.product.category.id,
          name: item.product.name,
          sellingPrice: item.product.sellingPrice,
          profitPercentage: null,
          costPrice: item.product.costPrice,
          shippingCost: item.product.shippingCost,
          taxable: item.product.taxable,
          additionalExpenses: item.product.additionalExpenses,
          safetyStock: item.product.safetyStock,
          addedDate: item.product.dateAdded,
          status: item.product.status
        });
      }
      throw new BadRequestException(`Failed to create sale: ${error.message}`);
    }
  }

  async payInstallment(installmentId: string, installmentDTO: PayInstallmentDTO): Promise<Installment> {
    
    const installment = await this.installmentRepository.findOne({ where: { id: installmentId } });
  
    if (!installment) {
      throw new NotFoundException(`Installment with ID ${installmentId} not found`);
    }
  
    if (installment.status === EInstallmentStatus.PAID) {
      throw new BadRequestException(`Installment already paid`);
    }
  
    installment.amountPaid += installmentDTO.amountPaid;
  
    // Check if the installment is fully paid
    if (installment.amount = installment.amountPaid) {
      installment.status = EInstallmentStatus.PAID;
    } else {
      installment.status = EInstallmentStatus.PENDING;
    }
    installment.paidDate = installmentDTO.paidDate;
  
    // Save the updated installment
    return await this.installmentRepository.save(installment);
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
