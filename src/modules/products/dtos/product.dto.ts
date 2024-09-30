import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { EDiscountType } from "src/common/Enum/EDiscount.enum";

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  category: string;

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
  @IsString()
  vendor: string;

  @ApiProperty()
  @IsString()
  vendorContactNumber: string;

  @ApiProperty()
  @IsString()
  vendorLocation: string;

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