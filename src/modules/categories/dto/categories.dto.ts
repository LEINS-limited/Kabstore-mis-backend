import { ApiProperty } from '@nestjs/swagger';
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
  profitPercentage: number;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  picture: Express.Multer.File;
}
