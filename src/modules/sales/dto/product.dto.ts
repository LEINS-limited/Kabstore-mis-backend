import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {  IsEnum, IsOptional, IsString, Min } from "class-validator";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { ESaleStatus } from "src/common/Enum/ESaleStatus.entity";
import { CreateCustomerDTO } from "src/modules/customers/dtos/customers.dto";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";

export class CreateSaleDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CreateCustomerDTO)
  customer?: CreateCustomerDTO;

  @ApiProperty({ required: false })
  @IsOptional()
  customerId?: string;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  saleDate: Date;

  @ApiProperty({ enum: ESaleStatus })
  @IsEnum(ESaleStatus)
  status: ESaleStatus;

  @ApiProperty({ enum: EPaymentType })
  @IsEnum(EPaymentType)
  paymentType: EPaymentType;

  @ApiProperty()
  @Min(0)
  amountDue: number;
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
  quantity: number;

  @ApiProperty()
  safetyStock: number;

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