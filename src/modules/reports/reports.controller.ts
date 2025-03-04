import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('reports')
@ApiTags('reports')
@Public()
@ApiBearerAuth('JWT-auth')
@Roles('OPERATIONS_MANAGER', 'ADMIN', 'SALES_PERSON')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/revenue-profit/:year/:month')
  getMonthlyRevenueProfits(
    @Param('month') month: number,
    @Param('year') year: number
  ) {
    return this.reportsService.calculateRevenueAndProfitsByMonth(year, month);
  }

  @Get('/store-metrics')
  getStoreMetrics() {
    console.log('================= getStoreMetrics =================');
    return this.reportsService.getStoreMetrics();
  }

  @Get('/sales-by-category')
  async getSalesByCategory(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date
  ) {
    return this.reportsService.getSalesByCategory(startDate, endDate);
  }

  @Get('/customer-analytics')
  async getCustomerAnalytics() {
    return this.reportsService.getCustomerAnalytics();
  }

  @Get('/financial-summary')
  async getFinancialSummary(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date
  ) {
    return this.reportsService.getFinancialSummary(startDate, endDate);
  }

  @Get('/financial-trends')
  async getFinancialTrends(
    @Query('groupBy') groupBy: 'week' | 'month' = 'month',
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    return this.reportsService.getFinancialTrends(groupBy, startDate, endDate);
  }
}
