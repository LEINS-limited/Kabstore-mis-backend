import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO, UpdateProductDto } from './dtos/product.dto';
import { ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorators/public.decorator';
import { ApiResponse } from 'src/common/payload/ApiResponse';

@Public() 
@Controller('products')
@ApiTags('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  findAll() {
    return this.productService.getProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: CreateProductDTO,
  })
  async create(
    @Body() createProductDto: CreateProductDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return new ApiResponse( true, "Product saved successfullly!", await this.productService.create(createProductDto, file));
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
