import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/categories.dto';
import { Public } from 'src/decorators/public.decorator';


@Controller('categories')
@ApiTags('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoryService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDTO) {
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDTO>,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.delete(+id);
  }
}
