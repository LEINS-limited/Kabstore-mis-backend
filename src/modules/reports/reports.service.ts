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
        console.log('getStoreMetrics');
        try {
            // Existing metrics
            const bestSellingProducts = await this.salesRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.saleItems', 'saleItem')
                .leftJoinAndSelect('saleItem.product', 'product')
                .leftJoinAndSelect('product.category', 'category')
                .select([
                    'category.name as categoryName',
                    'category."pictureUrl" as categoryImage',
                    'product.name as productName',
                    'SUM(saleItem.quantity) as totalQuantity',
                    'SUM(saleItem.quantity * product.sellingPrice) as totalRevenue'
                ])
                .groupBy('category.name,category."pictureUrl", product.name')
                .orderBy('totalQuantity', 'DESC')
                .getRawMany();

            // Total expenses
            const totalExpenses = await this.expenseRepository
                .createQueryBuilder('expense')
                .select('COALESCE(SUM(expense.amount), 0)', 'total')
                .getRawOne();

            // Total products count
            const totalProducts = await this.productRepository.count();

            // Generate array of last 12 months
            const generateLast12Months = () => {
                const months = [];
                const today = new Date();
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    months.push({
                        date: date,
                        formatted: `${date.getMonth() + 1}-${date.getFullYear()}`
                    });
                }
                return months;
            };
            console.log('generateLast12Months');
            const last12Months = generateLast12Months();
            console.log('last12Months', last12Months);

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
                    startDate: last12Months[0].date
                })
                .groupBy('month')
                .orderBy('month', 'ASC')
                .getRawMany();
            console.log('monthlySales', monthlySales);
            // Format monthly sales data with all months
            const formattedMonthlySales = last12Months.map(monthObj => {
                const monthData = monthlySales.find(
                    sale => {
                        const saleDate = new Date(sale.month);
                        return saleDate.getMonth() === monthObj.date.getMonth() &&
                               saleDate.getFullYear() === monthObj.date.getFullYear();
                    }
                ) || {
                    totalSales: 0,
                    revenue: 0,
                    creditSales: 0,
                    outstandingAmount: 0
                };
                console.log('monthObj', monthObj);
                return {
                    month: monthObj.formatted,
                    totalSales: Number(monthData.totalSales || 0),
                    revenue: Number(monthData.revenue || 0),
                    creditSales: Number(monthData.creditSales || 0),
                    outstandingAmount: Number(monthData.outstandingAmount || 0)
                };
            }).sort((a, b) => {
                const [aMonth, aYear] = a.month.split('-').map(Number);
                const [bMonth, bYear] = b.month.split('-').map(Number);
                return (aYear - bYear) || (aMonth - bMonth);
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
                    'customer.name as "customerName"',
                    'customer.contactNumber as "contactNumber"',
                    'COUNT(sale.id) as "totalPurchases"',
                    'SUM(sale.totalPrice) as "totalSpent"',
                    'SUM(sale.amountDue) as "outstandingAmount"'
                ])
                .groupBy('customer.id')
                .orderBy('"totalSpent"', 'DESC')
                .limit(10)
                .getRawMany();
            const formattedTopCustomers = topCustomers.map(customer => ({
                ...customer,
                totalPurchases: Number(customer.totalPurchases),
                totalSpent: Number(customer.totalSpent),
                outstandingAmount: Number(customer.outstandingAmount)
            })).sort((a, b) => b.totalSpent - a.totalSpent);
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

    async getFinancialSummary(startDate: Date, endDate: Date) {
        try {
            // Get total expenses
            const expenses = await this.expenseRepository
                .createQueryBuilder('expense')
                .select('COALESCE(SUM(expense.amount), 0)', 'total')
                .where('expense.expenseDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate
                })
                .getRawOne();

            // Get total sales
            const sales = await this.salesRepository
                .createQueryBuilder('sale')
                .select([
                    'COALESCE(SUM(sale.totalPrice), 0) as "totalRevenue"',
                    'COUNT(sale.id) as "totalSales"',
                    'COALESCE(SUM(sale.amountDue), 0) as "totalOutstanding"'
                ])
                .where('sale.saleDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate
                })
                .getRawOne();

            return {
                totalExpenses: Number(expenses.total),
                totalRevenue: Number(sales.totalRevenue),
                totalSales: Number(sales.totalSales),
                totalOutstanding: Number(sales.totalOutstanding),
                netIncome: Number(sales.totalRevenue) - Number(expenses.total)
            };
        } catch (error) {
            throw new BadRequestException('Error fetching financial summary: ' + error.message);
        }
    }

    async getFinancialTrends(
        groupBy: 'week' | 'month',
        startDate?: Date,
        endDate?: Date
    ) {
        try {
            // For sales query
            const saleDateGroup = groupBy === 'week' ? 
                `TO_CHAR(s.saleDate, 'Dy') || ' (' || 
                 TO_CHAR(DATE_TRUNC('week', s.saleDate), 'DD/MM') || ' - ' || 
                 TO_CHAR(DATE_TRUNC('week', s.saleDate) + INTERVAL '6 days', 'DD/MM') || ')'` : 
                'TO_CHAR(s.saleDate, \'Mon\')';
            
            const saleDateOrder = groupBy === 'week' ? 
                'DATE_TRUNC(\'week\', s.saleDate)' : 
                'EXTRACT(MONTH FROM s.saleDate)';

            // For expense query
            const expenseDateGroup = groupBy === 'week' ? 
                `TO_CHAR(e.expenseDate, 'Dy') || ' (' || 
                 TO_CHAR(DATE_TRUNC('week', e.expenseDate), 'DD/MM') || ' - ' || 
                 TO_CHAR(DATE_TRUNC('week', e.expenseDate) + INTERVAL '6 days', 'DD/MM') || ')'` : 
                'TO_CHAR(e.expenseDate, \'Mon\')';
            
            const expenseDateOrder = groupBy === 'week' ? 
                'DATE_TRUNC(\'week\', e.expenseDate)' : 
                'EXTRACT(MONTH FROM e.expenseDate)';

            // Get sales trends
            const salesTrends = await this.salesRepository
                .createQueryBuilder('s')
                .select([
                    `${saleDateGroup} as period`,
                    'COALESCE(SUM(s.totalPrice), 0) as revenue',
                    'COUNT(s.id) as "totalSales"',
                    'COALESCE(SUM(s.amountDue), 0) as outstanding'
                ]) 
                .where(startDate && endDate ? 's.saleDate BETWEEN :startDate AND :endDate' : '1=1', {
                    startDate,
                    endDate
                })
                .groupBy('period')
                .addGroupBy(saleDateOrder)
                .orderBy(saleDateOrder, 'ASC')
                .getRawMany();

            // Get expense trends
            const expenseTrends = await this.expenseRepository
                .createQueryBuilder('e')
                .select([
                    `${expenseDateGroup} as period`,
                    'COALESCE(SUM(e.amount), 0) as total'
                ])
                .where(startDate && endDate ? 'e.expenseDate BETWEEN :startDate AND :endDate' : '1=1', {
                    startDate,
                    endDate
                })
                .groupBy('period')
                .addGroupBy(expenseDateOrder)
                .orderBy(expenseDateOrder, 'ASC')
                .getRawMany();

            // Combine sales and expenses data
            const trends = salesTrends.map(sale => {
                const expense = expenseTrends.find(exp => exp.period === sale.period) || { total: 0 };
                return {
                    period: sale.period,
                    revenue: Number(sale.revenue),
                    expenses: Number(expense.total),
                    totalSales: Number(sale.totalSales),
                    outstanding: Number(sale.outstanding),
                    netIncome: Number(sale.revenue) - Number(expense.total)
                };
            });

            return {
                groupBy,
                trends
            };
        } catch (error) {
            throw new BadRequestException('Error fetching financial trends: ' + error.message);
        }
    }
}
