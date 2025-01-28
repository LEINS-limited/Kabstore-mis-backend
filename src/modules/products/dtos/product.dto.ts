import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { EProductStatus } from "src/common/Enum/EProductStatus.enum";
import { CreateVendorDTO } from "src/modules/vendors/dtos/vendors.dto";
import { IsUUID } from "src/common/decorators/uuid.decorator";

export class CreateProductDTO {
  @ApiProperty({
    example: 'MacBook Pro M3 14-inch',
    description: 'Name of the product'
  })
  @IsString()
  name: string;

  @IsUUID()
  @ApiProperty({
    example: '2a8b4f6e-9c3d-4e5f-8g7h-1i2j3k4l5m6n',
    description: 'UUID of the product category (e.g., Laptops)'
  })
  categoryId: string;

  @ApiProperty({
    example: 2499000,
    description: 'Optional: Custom selling price. If provided, automatic price calculations will be ignored',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customSellingPrice?: number;


  @ApiProperty({
    example: 75000,
    description: 'Additional costs like warranty, setup fees'
  })
  @IsNumber()
  additionalExpenses: number;

  @ApiProperty({
    example: 2100000,
    description: 'Initial purchase price'
  })
  @Min(0)
  initialPrice: number;

  @ApiProperty({
    example: 150000,
    description: 'Shipping and import costs'
  })
  @Min(0)
  shippingCost: number;

  @ApiProperty({
    example: 10,
    description: 'Current stock quantity'
  })
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: true,
    description: 'Whether the product is subject to VAT'
  })
  @IsBoolean()
  taxable: boolean;

  @ApiProperty({
    required: false,
    example: {
      name: 'Apple Rwanda Distributor Ltd',
      contactNumber: '+250788123456',
      location: 'Kigali Heights, Kigali'
    }
  })
  @IsOptional()
  @Type(() => CreateVendorDTO)
  vendor?: CreateVendorDTO;

  @ApiProperty({
    required: false,
    example: '',
    description: 'Leave empty if providing vendor details'
  })
  @IsOptional()
  vendorId?: string;

  @ApiProperty({
    example: 5,
    description: 'Minimum stock level before reorder'
  })
  safetyStock: number;

  @ApiProperty({
    example: '2024-01-25T09:15:38.220Z',
    description: 'Date when product was added to inventory'
  })
  @Transform(({ value }) => new Date(value))
  dateAdded: Date;

  @ApiProperty({
    required: false,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Product warranty expiration date'
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiryDate: Date;

  @IsEnum(EProductStatus, {
    message: `status must be one of: ${Object.values(EProductStatus).join(', ')}`
  })
  @ApiProperty({
    enum: EProductStatus,
    example: 'ACTIVE',
    description: 'Product status in inventory'
  })
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