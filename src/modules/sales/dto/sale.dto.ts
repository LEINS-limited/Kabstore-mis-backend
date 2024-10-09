import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {  IsArray, IsEnum, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
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
  @IsArray({})
  @ValidateNested()
  saleItems: CreateSaleItemDto[];

  @ApiProperty()
  @Min(0)
  amountDue: number;
}

export class CreateSaleItemDto{

  @ApiProperty()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  productId: string;
}