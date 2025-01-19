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

    @ApiProperty({ enum: ERole , example: ERole.SALES_PERSON})
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
export class CreateUserByAdminDto {
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

<<<<<<< HEAD
  @ApiProperty({ enum: ERole, example: ERole.OPERATIONS_MANAGER })
=======
  @ApiProperty({ enum: ERole })
>>>>>>> 86638e962096c42def97accc6354df59c6fedc34
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

}