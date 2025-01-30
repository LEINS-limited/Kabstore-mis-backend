import { Body, Controller, Delete, Get, Param, Post, Query, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { ExpensesService } from './expenses.service';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { CreateExpenseDTO } from './dto/expense.dto';
import { ExpenseStatus } from 'src/common/Enum/ExpenseStatus.enum';

@Controller('expenses')
@Public()
@ApiTags('expenses')
@ApiBearerAuth('JWT-auth')
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

  @Patch(':id/status')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ExpenseStatus)
        }
      }
    }
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ExpenseStatus
  ) {
    const expense = await this.expenseService.updateStatus(id, status);
    return new ApiResponse(true, 'Expense status updated successfully!', expense);
  }

  @Get('all/statistics')
  async countTotalProducts() {
    return new ApiResponse(
      true,
      'Successful!',
      await this.expenseService.expenseStats(),
    );
  }

  @Get('all/expenseNames')
  async getExpenseNames() {
    return new ApiResponse(true, 'Expense names retrieved successfully!', await this.expenseService.getExpenseNames());
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.delete(id);
  }
}
