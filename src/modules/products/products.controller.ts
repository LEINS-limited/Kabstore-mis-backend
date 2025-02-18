import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO, UpdateProductDto, UpdateVendorDTO } from './dtos/product.dto';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { Public } from 'src/decorators/public.decorator';
import { UUIDValidationPipe } from 'src/common/pipes/uuid.validation.pipe';
import { EnumValidationPipe } from 'src/common/pipes/enum.validation.pipe';
import { EProductStatus } from 'src/common/Enum/EProductStatus.enum';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('products')
@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Public()
@Roles('OPERATION_MANAGER', 'ADMIN', 'SALES_PERSON')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Get('')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false })
  async getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('q') q?: string,
  ) {
    const products = await this.productService.getProductsPaginated(
      page,
      limit,
      q,
    );
    return new ApiResponse(true, 'Products retrieved successfully!', products);
  }

  @Post()
  @ApiBody({
    description: 'File upload',
    type: CreateProductDTO,
  })
  async create(
    @Body('categoryId', UUIDValidationPipe) categoryId: string,
    @Body('status', new EnumValidationPipe(EProductStatus)) status: EProductStatus,
    @Body() createProductDto: CreateProductDTO
  ) {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Get('all/statistics')
  async countTotalProducts() {
    return new ApiResponse(
      true,
      'Successful!',
      await this.productService.productsStats(),
    );
  }


  @Patch('/vendor/:id')
  updateVendor(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDTO,
  ) {
    return this.productService.updateVendor(id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Get('best-selling')
  async getBestSellingProducts() {
    return await this.productService.getBestSellingProductsByCategory();
  }
}
