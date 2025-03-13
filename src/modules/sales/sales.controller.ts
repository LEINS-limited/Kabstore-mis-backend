import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { Public } from 'src/decorators/public.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDTO } from './dto/sale.dto';
import { InstallmentDTO, PayInstallmentDTO } from 'src/common/dtos/installement.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from 'src/entities/user.entity';
import { GetUser } from 'src/decorators/get-user.decorator';
import { ESaleStatus } from 'src/common/Enum/ESaleStatus.entity';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { DateRangeDto } from 'src/common/dtos/date-range.dto';

@Controller('sales')
@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@Roles('OPERATIONS_MANAGER', 'ADMIN', 'SALES_PERSON')
export class SalesController {
  constructor(private readonly saleService: SalesService) { }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.getSaleById(id);
  }

  @Get('')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSales(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() dateRangeDto: DateRangeDto,
    @Query('q') q?: string,
  ) {
    const sales = await this.saleService.getSalesPaginated(page, limit, q, dateRangeDto);
    return new ApiResponse(true, 'Sales retrieved successfully!', sales);
  }

  @Get('all/by-product')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'productId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSalesByProduct(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() dateRangeDto: DateRangeDto,
    @Query('productId') productId?: string,
  ) {
    const sales = await this.saleService.getSalesByProductPaginated(page, limit, productId, dateRangeDto);
    return new ApiResponse(true, 'Sales retrieved successfully!', sales);
  }


  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSaleDto: CreateSaleDTO, @GetUser() user: User) {
    return this.saleService.create(createSaleDto, user);
  }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //     return this.saleService.update(id, updateProductDto);
  //   }

  @Get('all/statistics')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async countTotalProducts(
    @Query() dateRangeDto: DateRangeDto,
  ) {
    try {
      return new ApiResponse(
        true,
        'Successful!',
        await this.saleService.salesStats(dateRangeDto),
      );     
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Patch('/installments/:id/pay')
  async payInstallment(@Param('id') id: string, @Body() body: PayInstallmentDTO) {
    return this.saleService.payInstallment(id, body);
  }

  @Put('cancel-sale/:saleId')
  async updateSaleStatus(@Param('saleId') id: string) {
    console.log("id" + id);

    return this.saleService.cancelSale(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleService.delete(id);
  }
}
