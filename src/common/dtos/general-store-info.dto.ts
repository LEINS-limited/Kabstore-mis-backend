import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';
import { ECurrencyType } from '../Enum/ECurrenyType.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGeneralStoreInfoDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  @ApiProperty({ description: 'The percentage of profit for the store', example: 10 })
  generalProfitPercentage: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The base currency for the store', example: ECurrencyType.RWF })
  baseCurrency: ECurrencyType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ description: 'The conversion rate to USD', example: 1000 })
  toUSD: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ description: 'The conversion rate to Dirham', example: 1000 })
  toDirham: number;
}

export class UpdateGeneralStoreInfoDto extends CreateGeneralStoreInfoDto {} 