import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class IpasiProductDTO {
    @IsString()
    @ApiProperty()
    name:string;

    @IsNumber()
    @ApiProperty()
    quantity:number;

    @IsNumber()
    @ApiProperty()
    initialPrice: number;
}