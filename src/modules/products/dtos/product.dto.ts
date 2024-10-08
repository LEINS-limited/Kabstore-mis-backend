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
  @Min(0)
  costPrice: number;

  @ApiProperty()
  @Min(0)
  quantity: number;

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
  addedDate: Date;

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