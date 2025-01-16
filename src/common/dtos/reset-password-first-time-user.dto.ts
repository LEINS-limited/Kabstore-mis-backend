/* eslint-disable */
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNegative,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ResetPasswordForFirstTimeUserDTO {

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}
