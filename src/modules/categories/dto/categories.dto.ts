import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  description: string;

  //transform the value from api to number
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  profitPercentage: number;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  picture: Express.Multer.File;
}
