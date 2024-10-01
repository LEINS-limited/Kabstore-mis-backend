import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { EDiscountType } from "src/common/Enum/EDiscount.enum";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { Vendor } from "src/entities/vendors.entity";

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
  vendor: Vendor;

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

  @ApiProperty()
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