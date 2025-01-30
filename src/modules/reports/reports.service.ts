import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/entities/sales.entity'; // Adjust the import path as necessary
import { SaleItem } from 'src/entities/saleItem.entity'; // Adjust the import path as necessary
import { Product } from 'src/entities/products.entity'; // Adjust the import path as necessary
import { Customer } from 'src/entities/customers.entity'; // Adjust the import path as necessary

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Sale) private salesRepository: Repository<Sale>,
        @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    ) {}

    async calculateRevenueAndProfitsByMonth(year: number, month: number) {
        try {
            if (month < 1 || month > 12) {
                throw new BadRequestException(`Invalid month ${month}`);
            }

            // Fetch sales for the given month and year
            const sales = await this.salesRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.saleItems', 'saleItem')
                .leftJoinAndSelect('saleItem.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .where('EXTRACT(YEAR FROM sale.saleDate) = :year', { year })
                .andWhere('EXTRACT(MONTH FROM sale.saleDate) = :month', { month })
                .getMany();

            let totalRevenue = 0;
            let totalProfit = 0;
            let totalVAT = 0;

            // Calculate total revenue and profit
            sales.forEach(sale => {
                sale.saleItems.forEach(item => {
                    const product = item.product;
                    
                    // Calculate total cost price including all expenses
                    const totalCostPrice = product.initialPrice + 
                                         product.shippingCost + 
                                         (product.initialPrice * 0.18) + // 18% VAT
                                         (product.additionalExpenses || 0);

                    // Calculate selling price
                    // const profitPercentage = product.category.profitPercentage || 
                    //                        product.generalProfitPercentage;
                    
                    const revenue = item.product.sellingPrice * item.quantity;
                    const cost = totalCostPrice * item.quantity;
                    const profit = revenue - cost;

                    totalRevenue += revenue;
                    totalProfit += profit;
                    totalVAT += (product.initialPrice * 0.18) * item.quantity;
                });
            });

            return {
                revenue: totalRevenue,
                profit: totalProfit,
                vat: totalVAT,
                month,
                year
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'An error occurred while calculating revenue and profit');
        }
    }

    async getStoreSalesMetrics() {
        try {
            // Best selling products by category
            const bestSellingProducts = await this.salesRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.saleItems', 'saleItem')
                .leftJoinAndSelect('saleItem.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                    'category.name as categoryName',
                    'product.name as productName',
                    'SUM(saleItem.quantity) as totalQuantity',
                    'SUM(saleItem.quantity * product.sellingPrice) as totalRevenue'
                ])
                .groupBy('category.name, product.name')
                .orderBy('totalQuantity', 'DESC')
                .getRawMany();

            // Customer metrics
            const totalCustomers = await this.customerRepository.count();
            const customersWithCredit = await this.customerRepository
                .createQueryBuilder('customer')
                .getCount();

            // Outstanding payments
            const totalDueAmount = await this.salesRepository
                .createQueryBuilder('sale')
                .where('sale.amountDue > 0')
                .select('SUM(sale.amountDue)', 'totalDue')
                .getRawOne();

            // Sales by payment type
            const salesByPaymentType = await this.salesRepository
                .createQueryBuilder('sale')
                .select([
                    'sale.paymentType as type',
                    'COUNT(*) as count',
                    'SUM(sale.totalPrice) as total'
                ])
                .groupBy('sale.paymentType')
                .getRawMany();

            return {
                bestSellingProducts,
                customerMetrics: {
                    totalCustomers,
                    customersWithCredit,
                    totalDueAmount: totalDueAmount.totalDue || 0
                },
                salesByPaymentType
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Error fetching store metrics');
        }
    }
    async getSalesByCategory(startDate: Date, endDate: Date) {
        const sales = await this.salesRepository
          .createQueryBuilder('sale')
          .leftJoinAndSelect('sale.saleItems', 'saleItem')
          .leftJoinAndSelect('saleItem.product', 'product')
          .leftJoinAndSelect('product.category', 'category')
          .where('sale.saleDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .select([
            'category.name as categoryName',
            'SUM(saleItem.quantity) as totalQuantity',
            'SUM(saleItem.quantity * product.sellingPrice) as totalRevenue'
          ])
          .groupBy('category.name')
          .getRawMany();
      
        return sales;
      }
      async getCustomerAnalytics() {
        const customers = await this.customerRepository
          .createQueryBuilder('customer')
          .leftJoinAndSelect('customer.sales', 'sale')
          .select([
            'COUNT(DISTINCT customer.id) as totalCustomers',
            'SUM(CASE WHEN customer.creditBalance > 0 THEN 1 ELSE 0 END) as customersWithCredit',
            'SUM(customer.creditBalance) as totalCreditBalance',
            'COUNT(sale.id) as totalTransactions'
          ])
          .getRawOne();
      
        return customers;
      }
}
