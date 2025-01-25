import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class IpasiProductDTO {
    @ApiProperty()
    @IsString()
    productName: string;

    @ApiProperty()
    @IsNumber()
    quantitySold: number;

    @ApiProperty()
    @IsNumber()
    initialPrice: number;

    @ApiProperty()
    @IsNumber()
    sellingPrice: number;
}