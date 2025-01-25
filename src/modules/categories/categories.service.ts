import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/entities/categories.entity';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto/categories.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) public categoryRepository: Repository<Category>,
    private cloudinary: CloudinaryService,
  ) {}
  async getCategories(): Promise<Category[]> {
    const response = await this.categoryRepository.find();
    return response;
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async existsByName(name: string): Promise<Boolean> {
    const category = await this.categoryRepository.exist({ where: { name } });
    return category;
  }

  async create(
    createCategoryDto: CreateCategoryDTO,
    file: Express.Multer.File,
  ): Promise<Category> {
    const duplicate = await this.existsByName(createCategoryDto.name);
    if (duplicate) {
      throw new BadRequestException(
        `Category with name ${createCategoryDto.name} already exists!`,
      );
    }
    const newCategory = this.categoryRepository.create(createCategoryDto);
    const pictureUrl = await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
    newCategory.pictureUrl = pictureUrl.url;
    return this.categoryRepository.save(newCategory);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDTO,
    file: Express.Multer.File,
  ): Promise<Category> {
    const category = await this.getCategoryById(id);
    if (file) {
      const pictureUrl = await this.cloudinary.uploadImage(file).catch(() => {
        throw new BadRequestException('Invalid file type.');
      });
      category.pictureUrl = pictureUrl.url;
    }
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
