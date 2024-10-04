import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { CreateCategoryDTO } from "src/modules/categories/dto/categories.dto";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CreateCategoryDTO) // Automatically transform to the CreateCategoryDTO type
  category?: CreateCategoryDTO;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  sellingPrice: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  costPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CreateVendorDTO)
  vendor?: CreateVendorDTO;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  safetyStock: number;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasDiscount: boolean;

  @ApiProperty({ enum: EDiscountType })
  @IsEnum(EDiscountType)
  @Transform(({ value }) => value as EDiscountType)
  discountType: EDiscountType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discountValue: number;

  @ApiProperty()
  // @IsISO8601()
  @Transform(({ value }) => new Date(value))
  addedDate: Date;

  @ApiProperty()
  // @IsISO8601()
  @Transform(({ value }) => new Date(value))
  expiryDate: Date;

  @ApiProperty({ enum: EProductStatus })
  @IsEnum(EProductStatus)
  @Transform(({ value }) => value as EProductStatus)
  status: EProductStatus;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  picture: Express.Multer.File;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  inStock: boolean;
}