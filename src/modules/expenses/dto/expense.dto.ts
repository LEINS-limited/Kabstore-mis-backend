import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsOptional, Min } from "class-validator";
import { EExpenseCategory } from "src/common/Enum/EExpenseCategory.enum";
import { EPaymentType } from "src/common/Enum/EPaymentType.entity";
import { ExpenseStatus } from "src/common/Enum/ExpenseStatus.enum";
import { ExpenseItem } from "src/entities/expenseItem.entity";

export class CreateExpenseItemDto {

  @ApiProperty({enum: EExpenseCategory})
  category: EExpenseCategory;
}

export class CreateExpenseDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => CreateExpenseItemDto)
  expenseItem?: CreateExpenseItemDto;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  expenseDate: Date;

  @ApiProperty({ enum: ExpenseStatus })
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;

  @ApiProperty({ enum: EPaymentType })
  @IsEnum(EPaymentType)
  paymentType: EPaymentType;

  @ApiProperty()
  @Min(0)
  amount: number;
}
