import { IsDateString, IsISO8601, IsOptional } from "class-validator";

export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
