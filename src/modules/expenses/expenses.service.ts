import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EPaymentType } from 'src/common/Enum/EPaymentType.entity';
import { ExpenseStatus } from 'src/common/Enum/ExpenseStatus.enum';
import { Expense } from 'src/entities/expense.entity';
import { paginator } from 'src/utils/paginator';
import { Repository } from 'typeorm';
import { CreateExpenseDTO } from './dto/expense.dto';
import { generateCode } from 'src/utils/generator';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) public expenseRepository: Repository<Expense>,
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

  async getExpenseItemById(id: string): Promise<Expense> {
    const expenseItem = await this.expenseRepository.findOne({ where: { id } });
    if (!expenseItem) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expenseItem;
  }

  async expenseStats(): Promise<any> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async getExpensesPaginated(page: number, limit: number, search?: string) {
    try {
      const query = this.expenseRepository
      .createQueryBuilder('expense')

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
    } catch (error) {
      throw error;
    }
  }

  async getExpenseByItemPaginated(
    page: number,
    limit: number,
    expenseItemId: string,
  ) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async create(createExpenseDto: CreateExpenseDTO): Promise<Expense> {
    try {
      const newExpense = this.expenseRepository.create({
        ...createExpenseDto,
        code: generateCode('E'),
      });
  
      return await this.expenseRepository.save(newExpense);
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: ExpenseStatus): Promise<Expense> {
    try{
    const expense = await this.getExpenseById(id);
    
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    expense.status = status;
    return await this.expenseRepository.save(expense);
  }catch(error){
    throw error;
  }
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

  async getExpenseNames(): Promise<any> {
    try {
      var expenses = await this.expenseRepository.find();
      expenses = expenses.filter(expense => expense.expenseCategoryOrName !== null);
      const uniqueNames = [...new Set(expenses.map(expense => expense.expenseCategoryOrName))];
      return {names: uniqueNames};
 
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve expense names');
    }
  }

  async delete(id: string): Promise<void> {
    try{
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
  }catch(error){
    throw error;
  }
  }
}