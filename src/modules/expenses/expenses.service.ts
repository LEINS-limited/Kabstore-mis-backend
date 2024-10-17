import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EExpenseCategory } from 'src/common/Enum/EExpenseCategory.enum';
import { EPaymentType } from 'src/common/Enum/EPaymentType.entity';
import { ExpenseStatus } from 'src/common/Enum/ExpenseStatus.enum';
import { Expense } from 'src/entities/expense.entity';
import { ExpenseItem } from 'src/entities/expenseItem.entity';
import { paginator } from 'src/utils/paginator';
import { Repository } from 'typeorm';
import { CreateExpenseDTO } from './dto/expense.dto';
import { generateCode } from 'src/utils/generator';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) public expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseItem)
    public expenseItemRepository: Repository<ExpenseItem>,
  ) {}
  async getExpenses(): Promise<Expense[]> {
    const response = await this.expenseRepository.find();
    return response;
  }

  async getExpenseById(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async getExpenseItemById(id: string): Promise<ExpenseItem> {
    const expenseItem = await this.expenseItemRepository.findOne({ where: { id } });
    if (!expenseItem) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expenseItem;
  }

  async expenseStats(): Promise<any> {
    const totalCount = await this.expenseRepository.count();
    const payment_pending = await this.expenseRepository.count({
      where: { status: ExpenseStatus.PENDING },
    });
    const payment_completed = await this.expenseRepository.count({
      where: { status: ExpenseStatus.COMPLETED },
    });

    const payment_in_progress = await this.expenseRepository.count({
      where: { status: ExpenseStatus.IN_PROGRESS },
    });

    const paid_by_cash = await this.expenseRepository.count({
      where: { paymentType: EPaymentType.CASH },
    });

    const paid_by_momo = await this.expenseRepository.count({
      where: { paymentType: EPaymentType.MOMO },
    });

    const paid_by_bank = await this.expenseRepository.count({
      where: { paymentType: EPaymentType.BANK },
    });

    return {
      totalCount,
      payment_completed,
      payment_in_progress,
      payment_pending,
      paid_by_bank,
      paid_by_cash,
      paid_by_momo,
    };
  }

  async getExpensesPaginated(page: number, limit: number, search?: string) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.expenseItem', 'expenseItem');

    if (search) {
      query.where(
        'expense.name ILIKE :search OR expense.status ILIKE :search OR expense.category ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [expenses, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { expenses, meta };
  }

  async getExpenseByItemPaginated(
    page: number,
    limit: number,
    expenseItemId: string,
  ) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.expenseItem', 'expenseItem')
      .where('expenseItem.id = :expenseItemId', {
        expenseItemId: `${expenseItemId}`,
      });

    const [expenses, count] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = paginator({ page, limit, total: count });
    return { expenses, meta };
  }

  async create(createExpenseDto: CreateExpenseDTO): Promise<Expense> {
    let expenseItem: ExpenseItem = null;

    if (createExpenseDto.expenseItemId != '') {
      expenseItem = await this.getExpenseItemById(
        createExpenseDto.expenseItemId,
      );
    } else {
         let item = this.expenseItemRepository.create(createExpenseDto.expenseItem);
         expenseItem = await this.expenseItemRepository.save(item);
    }


    const newExpense = this.expenseRepository.create({
      ...createExpenseDto,
      expenseItem: expenseItem,
      code: generateCode('E'),
    });

    return await this.expenseRepository.save(newExpense);
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
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
  }
}