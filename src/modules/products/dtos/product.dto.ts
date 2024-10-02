import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { CreateCategoryDTO } from "src/modules/categories/dto/categories.dto";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({required:false})
  @IsOptional()
  category: CreateCategoryDTO;

  @ApiProperty({required:false})
  // @IsUUID()
  @IsOptional()
  categoryId: string;

  @ApiProperty()
  sellingPrice: number;

  @ApiProperty()
  costPrice: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({required:false})
  @IsOptional()
  vendor: CreateVendorDTO;

  @ApiProperty({required:false})
  // @IsUUID()
  @IsOptional()
  vendorId: string;

  @ApiProperty()
  safetyStock: number;

  @ApiProperty()
  hasDiscount: false;

  @ApiProperty({ enum: EDiscountType })
  @IsEnum(EDiscountType)
  discountType: EDiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  expiryDate: Date;

  @ApiProperty({ enum: EProductStatus })
  @IsEnum(EProductStatus)
  status: EProductStatus;

  @ApiProperty({
    description: 'Product icon',
    type: 'string',
    format: 'binary',
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