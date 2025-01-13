/* eslint-disable */
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsEmail,
    IsStrongPassword,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERole } from '../Enum/ERole.enum';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    myGender: string;

    @ApiProperty({ enum: ERole , example: ERole.USER})
    @IsEnum(ERole)
    role: ERole;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    national_id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @IsPhoneNumber()
    phonenumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @IsStrongPassword()
    password: string;
}
