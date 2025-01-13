import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';

@Controller('reports')
@ApiTags('reports')
@Public()
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/total-profits-and-revenue-by-month/:year/:month')
  findAll(@Param('month') month: number,@Param('year') year: number) {
    return this.reportsService.calculateRevenueAndProfitsByMonth(year,month);
  }

 

}
