import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { Public } from 'src/decorators/public.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDTO } from './dto/sale.dto';

@Controller('sales')
@Public()
@ApiTags('sales')
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly saleService: SalesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.getSaleById(id);
  }

  @Get('')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false })
  async getSales(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
  ) {
    const sales = await this.saleService.getSalesPaginated(page, limit, q);
    return new ApiResponse(true, 'Sales retrieved successfully!', sales);
  }

  @Get('all/by-product')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'productId', required: true })
  async getSalesByProduct(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('productId') productId?: string,
  ) {
    const sales = await this.saleService.getSalesByProductPaginated(page, limit, productId);
    return new ApiResponse(true, 'Sales retrieved successfully!', sales);
  }

  
  @Post()
  create(@Body() createSaleDto: CreateSaleDTO) {
    return this.saleService.create(createSaleDto);
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
      await this.saleService.salesStats(),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleService.delete(id);
  }
}
