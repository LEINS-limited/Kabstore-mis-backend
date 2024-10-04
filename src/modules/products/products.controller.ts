import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO, UpdateProductDto } from './dtos/product.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('products')
@ApiTags('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  async findAll() {
    return await this.productService.getProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Post()
  @ApiBody({
    description: 'File upload',
    type: CreateProductDTO,
  })
  create(
    @Body() createProductDto: CreateProductDTO,
  ) {
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
