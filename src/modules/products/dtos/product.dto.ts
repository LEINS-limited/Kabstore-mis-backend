import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { Vendor } from "src/entities/vendors.entity";
import { CreateCategoryDTO } from "src/modules/categories/dto/categories.dto";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  category: CreateCategoryDTO;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  sellingPrice: number;

  @ApiProperty()
  @IsNumber()
  costPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  vendor: CreateVendorDTO;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  vendorId: string;

  @ApiProperty()
  @IsNumber()
  safetyStock: number;

  @ApiProperty()
  @IsBoolean()
  hasDiscount: false;

  @ApiProperty({ enum: EDiscountType })
  @IsEnum(EDiscountType)
  discountType: EDiscountType;

  @ApiProperty()
  @IsNumber()
  discountValue: number;

  @ApiProperty()
  expiryDate: Date;

  @ApiProperty({enum: EProductStatus})
  @IsEnum(EProductStatus)
  status : EProductStatus;
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