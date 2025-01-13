import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/entities/sales.entity'; // Adjust the import path as necessary
import { SaleItem } from 'src/entities/saleItem.entity'; // Adjust the import path as necessary
import { Product } from 'src/entities/products.entity'; // Adjust the import path as necessary

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Sale) private salesRepository: Repository<Sale>,
    ) {}

    async calculateRevenueAndProfitsByMonth(year: number, month: number) {
        try {
            if (month < 1 || month > 12) {
                throw new BadRequestException(`Invalid month ${month}`,);
            }

            // Fetch sales for the given month and year
            const sales = await this.salesRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.saleItems', 'saleItem')
                .leftJoinAndSelect('saleItem.product', 'product')
                .where('EXTRACT(YEAR FROM sale.saleDate) = :year', { year })
                .andWhere('EXTRACT(MONTH FROM sale.saleDate) = :month', { month })
                .getMany();

            let totalRevenue = 0;
            let totalProfit = 0;

            // Calculate total revenue and profit
            sales.forEach(sale => {
                sale.saleItems.forEach(item => {
                    const revenue = item.product.sellingPrice * item.quantity;
                    const cost = item.product.costPrice * item.quantity;
                    totalRevenue += revenue;
                    totalProfit += (revenue - cost);
                });
            });

            return {
                revenue: totalRevenue,
                profit: totalProfit,
            };
        } catch (error) {
            // Handle errors accordingly
            throw new BadRequestException(error.message || 'An error occurred while calculating revenue and profit');
        }
    }
}
