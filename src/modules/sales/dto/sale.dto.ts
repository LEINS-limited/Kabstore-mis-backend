import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ESaleStatus } from "src/common/Enum/ESaleStatus.entity";
import { InstallmentDTO } from "src/common/dtos/installement.dto";
import { IpasiProductDTO } from "src/common/dtos/ipasi-product.dto";
import { CreateCustomerDTO } from "src/modules/customers/dtos/customers.dto";

class SaleItemDTO {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Product ID to be sold"
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 2,
    description: "Quantity of product being sold"
  })
  @IsNumber()
  quantitySold: number;

  @ApiProperty({
    example: false,
    description: "Selling item for custom price"
  })
  @IsBoolean()
  sellingOnCustomPrice: boolean;

  @ApiProperty({
    example: 10000,
    description: "Price in case sellingOnCustomPrice is true"
  })
  @IsOptional()
  @IsNumber()
  customPrice?: number;
}

export class CreateSaleDTO {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Optional: Existing customer ID. Either this or newCustomer must be provided"
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({
    example: {
      name: "John Doe",
      contactNumber: "+250789123456",
      email: "john@example.com"
    },
    description: "Optional: New customer details. Either this or customerId must be provided"
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDTO)
  newCustomer?: CreateCustomerDTO;

  @ApiProperty({
    type: [SaleItemDTO],
    example: [
      {
        productId: "550e8400-e29b-41d4-a716-446655440000",
        quantitySold: 2,
        sellingOnCustomPrice: true,
        customPrice: 2000
      }],
    description: "Regular products being sold"
  })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDTO)
  saleItems: SaleItemDTO[];

  @ApiProperty({
    enum: EPaymentType,
    example: EPaymentType.CASH,
    description: "Payment method (CASH, MOMO, BANK)"
  })
  @IsEnum(EPaymentType)
  paymentType: EPaymentType;

  @ApiProperty({
    example: 1000,
    description: "Amount due for credit sales. Required when status is PENDING",
    required: false
  })
  @IsOptional()
  @IsNumber()
  amountDue?: number;

  @ApiProperty({
    enum: ESaleStatus,
    example: ESaleStatus.PENDING,
    description: "Sale status (PENDING, IN_PROGRESS, COMPLETED)"
  })
  @IsEnum(ESaleStatus)
  status: ESaleStatus;

  @ApiProperty({
    type: [IpasiProductDTO],
    example: [{
      productName: "Custom Product",
      quantitySold: 1,
      initialPrice: 1000,
      sellingPrice: 1200
    }],
    required: false,
    description: "Optional: IPASI (custom) products being sold"
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IpasiProductDTO)
  ipasiProducts?: IpasiProductDTO[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstallmentDTO)
  @ApiProperty({ type: InstallmentDTO, isArray: true })
  @IsArray()
  installments?: InstallmentDTO[];
}