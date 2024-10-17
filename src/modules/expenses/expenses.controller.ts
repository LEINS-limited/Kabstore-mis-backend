import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { ExpensesService } from './expenses.service';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { CreateExpenseDTO } from './dto/expense.dto';

@Controller('expenses')
@Public()
@ApiTags('expenses')
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expenseService: ExpensesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.getExpenseById(id);
  }

  @Get('')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false })
  async getExpenses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
  ) {
    const expenses = await this.expenseService.getExpensesPaginated(page, limit, q);
    return new ApiResponse(true, 'Expenses retrieved successfully!', expenses);
  }

  @Get('all/by-expenseItem')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'expenseItemId', required: true })
  async getExpensesByExpenseItem(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('expenseItemId') expensseItemId?: string,
  ) {
    const expenses = await this.expenseService.getExpenseByItemPaginated(
      page,
      limit,
      expensseItemId,
    );
    return new ApiResponse(true, 'Expenses retrieved successfully!', expenses);
  }

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDTO) {
    return new ApiResponse(true, "Expense Created Successfully!", await this.expenseService.create(createExpenseDto));
  }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //     return this.saleService.update(id, updateProductDto);
  //   }

  @Get('all/statistics')
  async countTotalProducts() {
    return new ApiResponse(
      true,
      'Successful!',
      await this.expenseService.expenseStats(),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }
}
