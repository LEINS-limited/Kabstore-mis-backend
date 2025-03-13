import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  profitPercentage?: number = 0;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  picture: Express.Multer.File;
}

export class UpdateCategoryDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  profitPercentage?: number;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  picture?: Express.Multer.File;
}
