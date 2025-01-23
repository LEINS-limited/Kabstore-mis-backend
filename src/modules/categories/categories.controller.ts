import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDTO } from './dto/categories.dto';
import { Public } from 'src/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
@ApiTags('categories')
@ApiBearerAuth()
@Public()
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
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createCategoryDto: CreateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.create(createCategoryDto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDTO>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoryService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
