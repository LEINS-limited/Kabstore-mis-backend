import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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
import { User } from 'src/entities/user.entity';
import { DateRangeDto } from 'src/common/dtos/date-range.dto';  
@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) public saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem) public saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Installment) public installmentRepository: Repository<Installment>,
    private customerService: CustomersService,
    private productService: ProductsService,
  ) { }
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

  async salesStats(dateRangeDto?: DateRangeDto): Promise<any> {
    const totalCount = await this.saleRepository.count();
    const saleDate = (dateRangeDto.startDate && dateRangeDto.endDate) ? Between(new Date(dateRangeDto.startDate), new Date(dateRangeDto.endDate)):undefined;
    const payment_pending = await this.saleRepository.count({
      where: { 
        status: ESaleStatus.PENDING, 
        saleDate
      },
    });
    const payment_completed = await this.saleRepository.count({
      where: { 
        status: ESaleStatus.COMPLETED, 
        saleDate
      },
    });

    const payment_in_progress = await this.saleRepository.count({
      where: { 
        status: ESaleStatus.IN_PROGRESS, 
        saleDate
      },
    });

    const paid_by_cash = await this.saleRepository.count({
      where: { 
        paymentType: EPaymentType.CASH, 
        saleDate
      },
    });

    const paid_by_momo = await this.saleRepository.count({
      where: { 
        paymentType: EPaymentType.MOMO, 
        saleDate
      },
    });

    const paid_by_bank = await this.saleRepository.count({
      where: { 
        paymentType: EPaymentType.BANK, 
        saleDate
      },
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

  async getSalesPaginated(page: number, limit: number, search?: string, dateRangeDto?: DateRangeDto) {
    try{
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .leftJoinAndSelect('sale.installments', 'installments');

    if (search) {
      query.where('sale.status ILIKE :search OR customer.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (dateRangeDto.startDate && dateRangeDto.endDate) {
      query
      .where('sale.saleDate >= :starDate', { startDate: dateRangeDto.startDate })
      .andWhere('sale.saleDate <= :endDate', { endDate: dateRangeDto.endDate });
    }
    const [sales, count] = await query  
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { sales, meta };
  }catch(error){
    throw error;
  }
  }

  async getSalesByProductPaginated(page: number, limit: number, productId: string, dateRangeDto?: DateRangeDto) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.saleItems', 'saleItems')
      .leftJoinAndSelect('saleItems.product', 'product')
      .leftJoinAndSelect('sale.installments', 'installments')
      .where('product.id = :productId', {
        productId: `${productId}`,
      });

    if (dateRangeDto.endDate && dateRangeDto.startDate) {
      query.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate: dateRangeDto.startDate,
        endDate: dateRangeDto.endDate,
      });
    }
    const [sales, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { sales, meta };
  }

  async create(createSaleDto: CreateSaleDTO, user: User): Promise<Sale> {
    let customer: Customer = null;
    let saleItems: SaleItem[] = [];
    let installments: Installment[] = [];
    let total = 0;
    let totalInstallment = 0;

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
            sellingOnCustomPrice: item.sellingOnCustomPrice,
            customSellingPrice: item.customPrice,
            total: item.sellingOnCustomPrice ? item.customPrice * item.quantitySold : item.quantitySold * product.sellingPrice
          });

          saleItems.push(await this.saleItemRepository.save(saleItem));
          total += saleItem.total;

          // Update product quantity
          await this.productService.update(product.id, {
            quantity: product.quantity - item.quantitySold,
            categoryId: product.category.id,
            name: product.name,
            sellingPrice: product.sellingPrice,
            profitPercentage: null,
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
          const installmentRecord = this.installmentRepository.create({
            amount: installment.amount,
            amountPaid: installment.amountPaid,
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
    total += ipasiProducts.reduce((acc, curr) => acc + curr.quantitySold * curr.sellingPrice, 0);
    // Create the sale
    const newSale = this.saleRepository.create({
      customer,
      saleItems,
      code: generateCode('S'),
      totalPrice: total,
      doneBy: user,
      amountDue: createSaleDto.status === ESaleStatus.PENDING ? (createSaleDto.amountDue || total) : 0,
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

    let installment = await this.installmentRepository.findOne({ where: { id: installmentId }, relations: ['sale'] });

    if (!installment) {
      throw new NotFoundException(`Installment with ID ${installmentId} not found`);
    }

    if (installment.status === EInstallmentStatus.PAID) {
      throw new BadRequestException(`Installment already paid`);
    }

    if(installmentDTO.amountPaid > (installment.amount - installment.amountPaid)){
      throw new BadRequestException(`Amount paid exceeds the remaining amount`);
    }

    installment.amountPaid += installmentDTO.amountPaid;

    // Check if the installment is fully paid
    if (installment.amount == installment.amountPaid) {
      installment.status = EInstallmentStatus.PAID;
    } else {
      installment.status = EInstallmentStatus.PENDING;
    }
    installment.paidDate = installmentDTO.paidDate;
    installment = await this.installmentRepository.save(installment)
    //update the sale status
    const sale = await this.saleRepository.findOne({
      where: { id: installment.sale.id },
      relations: ['installments']
    });
    
    const allInstallmentsPaid = sale.installments.every(inst => inst.status === EInstallmentStatus.PAID);

    
    if (allInstallmentsPaid) {
      sale.amountDue = 0;
      sale.status = ESaleStatus.COMPLETED;
    } else {
      const totalAmountDue = sale.installments
        .filter(inst => inst.status !== EInstallmentStatus.PAID) 
        .reduce((sum, inst) => sum + (inst.amount - inst.amountPaid), 0);
      sale.amountDue = totalAmountDue
      sale.status = ESaleStatus.IN_PROGRESS
    }
    await this.saleRepository.save(sale);

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

  async cancelSale(saleId: string): Promise<Sale> {
    const sale = await this.getSaleById(saleId);
    console.log(sale);

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${saleId} not found`);
    }
    console.log(sale.status);

    if (sale.status === ESaleStatus.CANCELED) {
      throw new BadRequestException(`Sale is already canceled`);
    }

    // Restore product quantities
    for (const saleItem of sale.saleItems) {
      const product = saleItem.product;
      product.quantity += saleItem.quantity;

      await this.productService.update(product.id, {
        quantity: product.quantity,
        categoryId: product.category.id,
        name: product.name,
        sellingPrice: product.sellingPrice,
        profitPercentage: null,
        costPrice: product.costPrice,
        shippingCost: product.shippingCost,
        taxable: product.taxable,
        additionalExpenses: product.additionalExpenses,
        safetyStock: product.safetyStock,
        addedDate: product.dateAdded,
        status: product.status
      });
    }

    // Mark sale as canceled
    sale.status = ESaleStatus.CANCELED;
    await this.saleRepository.save(sale);

    return sale;
  }


  async delete(id: string): Promise<void> {
    const result = await this.saleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  }


}
