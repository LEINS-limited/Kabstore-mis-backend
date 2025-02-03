import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class InstallmentDTO {
    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsNumber()
    amountPaid: number;

    @ApiProperty({
        example: '2024-01-25T09:15:38.220Z',
        description: 'Date when installment is supposed to be paid'
    })
     @Transform(({ value }) => new Date(value))
    dueDate: Date;
    
}

export class PayInstallmentDTO {

    @ApiProperty()
    @IsNumber()
    amountPaid: number;

    @ApiProperty({
        example: '2024-01-25T09:15:38.220Z',
        description: 'Date when installment is supposed to be paid'
    })
     @Transform(({ value }) => new Date(value))
    paidDate: Date;
    
}