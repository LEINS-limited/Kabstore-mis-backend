import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/entities/sales.entity'; // Adjust the import path as necessary
import { SaleItem } from 'src/entities/saleItem.entity'; // Adjust the import path as necessary
import { Product } from 'src/entities/products.entity'; // Adjust the import path as necessary
import { Customer } from 'src/entities/customers.entity'; // Adjust the import path as necessary
import { Expense } from 'src/entities/expense.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Sale) private salesRepository: Repository<Sale>,
        @InjectRepository(Customer) private customerRepository: Repository<Customer>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(Expense) private expenseRepository: Repository<Expense>,
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

    async getStoreMetrics() {
        try {
            // Existing metrics
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

            // Total expenses
            const totalExpenses = await this.expenseRepository
                .createQueryBuilder('expense')
                .select('COALESCE(SUM(expense.amount), 0)', 'total')
                .getRawOne();

            // Total products count
            const totalProducts = await this.productRepository.count();

            // Monthly sales data for charts (last 12 months)
            const generateLast12Months = () => {
                const months = [];
                const today = new Date();
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    months.push(date);
                }
                return months;
            };

            const last12Months = generateLast12Months();

            const monthlySales = await this.salesRepository
                .createQueryBuilder('sale')
                .select([
                    'DATE_TRUNC(\'month\', sale.saleDate) as month',
                    'COUNT(DISTINCT sale.id) as totalSales',
                    'COALESCE(SUM(sale.totalPrice), 0) as revenue',
                    'COUNT(CASE WHEN sale.amountDue > 0 THEN 1 END) as creditSales',
                    'COALESCE(SUM(sale.amountDue), 0) as outstandingAmount'
                ])
                .where('sale.saleDate >= :startDate', { 
                    startDate: last12Months[0]
                })
                .groupBy('month')
                .orderBy('month', 'ASC')
                .getRawMany();

            // Format monthly sales data with all months
            const formattedMonthlySales = last12Months.map(monthDate => {
                const monthData = monthlySales.find(
                    sale => new Date(sale.month).getMonth() === monthDate.getMonth() &&
                           new Date(sale.month).getFullYear() === monthDate.getFullYear()
                ) || {
                    totalSales: 0,
                    revenue: 0,
                    creditSales: 0,
                    outstandingAmount: 0
                };

                return {
                    month: monthDate.toISOString(),
                    totalSales: Number(monthData.totalSales) || 0,
                    revenue: Number(monthData.revenue) || 0,
                    creditSales: Number(monthData.creditSales) || 0,
                    outstandingAmount: Number(monthData.outstandingAmount) || 0
                };
            });

            // Get existing customer metrics
            const totalCustomers = await this.customerRepository.count();
            const customersWithCredit = await this.customerRepository
                .createQueryBuilder('customer')
                .leftJoin('customer.sales', 'sale')
                .where('sale.amountDue > 0')
                .getCount();

            // Outstanding payments
            const totalDueAmount = await this.salesRepository
                .createQueryBuilder('sale')
                .where('sale.amountDue > 0')
                .select('COALESCE(SUM(sale.amountDue), 0)', 'totalDue')
                .getRawOne();

            // Sales by payment type
            const salesByPaymentType = await this.salesRepository
                .createQueryBuilder('sale')
                .select([
                    'sale.paymentType as type',
                    'COUNT(*) as count',
                    'COALESCE(SUM(sale.totalPrice), 0) as total'
                ])
                .groupBy('sale.paymentType')
                .getRawMany();

            const formattedSalesByPaymentType = salesByPaymentType.map(type => ({
                type: type.type,
                count: Number(type.count),
                total: Number(type.total)
            }));

            return {
                bestSellingProducts,
                totalExpenses: Number(totalExpenses.total),
                totalProducts,
                monthlySales: formattedMonthlySales,
                customerMetrics: {
                    totalCustomers,
                    customersWithCredit,
                    totalDueAmount: Number(totalDueAmount.totalDue)
                },
                salesByPaymentType: formattedSalesByPaymentType
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
        try {
            const analytics = await this.customerRepository
                .createQueryBuilder('customer')
                .leftJoin('customer.sales', 'sale')
                .select([
                    'COUNT(DISTINCT customer.id) as totalCustomers',
                    'COUNT(DISTINCT sale.id) as totalTransactions',
                    'SUM(sale.totalPrice) as totalRevenue',
                    'SUM(CASE WHEN sale.amountDue > 0 THEN 1 ELSE 0 END) as creditedSales',
                    'SUM(sale.amountDue) as totalOutstandingAmount',
                    'COUNT(DISTINCT CASE WHEN sale.amountDue > 0 THEN customer.id END) as customersWithCredit'
                ])
                .getRawOne();

            // Get top customers by revenue
            const topCustomers = await this.customerRepository
                .createQueryBuilder('customer')
                .leftJoin('customer.sales', 'sale')
                .select([
                    'customer.name as customerName',
                    'customer.contactNumber as contactNumber',
                    'COUNT(sale.id) as totalPurchases',
                    'SUM(sale.totalPrice) as totalSpent',
                    'SUM(sale.amountDue) as outstandingAmount'
                ])
                .groupBy('customer.id')
                .orderBy('totalSpent', 'DESC')
                .limit(10)
                .getRawMany();
            const formattedTopCustomers = topCustomers.map(customer => ({
                ...customer,
                totalpurchases: Number(customer.totalpurchases),
                totalspent: Number(customer.totalspent),
                outstandingamount: Number(customer.outstandingamount)
            })).sort((a, b) => b.totalspent - a.totalspent);
            return {
                summary: {
                    totalCustomers: Number(analytics.totalCustomers) || 0,
                    totalTransactions: Number(analytics.totalTransactions) || 0,
                    totalRevenue: Number(analytics.totalRevenue) || 0,
                    creditedSales: Number(analytics.creditedSales) || 0,
                    totalOutstandingAmount: Number(analytics.totalOutstandingAmount) || 0,
                    customersWithCredit: Number(analytics.customersWithCredit) || 0
                },
                topCustomers: formattedTopCustomers
            };
        } catch (error) {
            throw new BadRequestException('Error fetching customer analytics: ' + error.message);
        }
    }
}
