import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {  IsArray, IsEnum, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ESaleStatus } from "src/common/Enum/ESaleStatus.entity";
import { CreateCustomerDTO } from "src/modules/customers/dtos/customers.dto";

export class CreateSaleItemDto {
  @ApiProperty()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  productId: string;
}

export class CreateIpasiSaleItemDto {
  @ApiProperty()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsString()
  productCode: string;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  @ApiProperty({ type: CreateSaleItemDto, isArray: true, required: false })
  @IsOptional()
  saleItems?: CreateSaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIpasiSaleItemDto)
  @ApiProperty({ type: CreateIpasiSaleItemDto, isArray: true, required: false })
  @IsOptional()
  ipasiSaleItems?: CreateIpasiSaleItemDto[];

  @ApiProperty()
  @Min(0)
  amountDue: number;
}

