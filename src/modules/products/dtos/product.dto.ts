import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({required:true})
  categoryId: string;

  @ApiProperty()
  @Min(0)
  sellingPrice: number;

  @ApiProperty()
  @IsNumber()
  additionalExpenses: number;

  @ApiProperty()
  @Min(0)
  initialPrice: number;

  @ApiProperty()
  @Min(0)
  shippingCost: number;

  @ApiProperty()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsBoolean()
  taxable : boolean;

  @ApiProperty({required:false})
  @IsOptional()
  @Type(() => CreateVendorDTO)
  vendor?: CreateVendorDTO;

  @ApiProperty({required:false})
  @IsOptional()
  vendorId?: string;

  @ApiProperty()
  safetyStock: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateAdded: Date;

  @ApiProperty({required:false})
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiryDate: Date;

  @ApiProperty({ enum: EProductStatus })
  @IsEnum(EProductStatus)
  status: EProductStatus;
}

export class UpdateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  sellingPrice: number;

  @ApiProperty()
  costPrice: number;
  
  @ApiProperty()
  @Min(0)
  shippingCost: number;


  @ApiProperty()
  @IsBoolean()
  taxable : boolean;

  @ApiProperty()
  @IsNumber()
  additionalExpenses: number;

  @ApiProperty()
  profitPercentage: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  safetyStock: number;

  @ApiProperty()
  // @IsISO8601()
  @Transform(({ value }) => new Date(value))
  addedDate: Date;

  @ApiProperty({ enum: EProductStatus })
  @IsEnum(EProductStatus)
  status: EProductStatus;
}

export class UpdateVendorDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CreateVendorDTO)
  vendor?: CreateVendorDTO;

  @ApiProperty({ required: false })
  @IsOptional()
  vendorId?: string;
}