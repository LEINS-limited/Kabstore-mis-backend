import { ApiProperty } from '@nestjs/swagger';
import {
  IsString
} from 'class-validator';


export class CreateCustomerDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  contactNumber: string;

  @ApiProperty()
  location: string;
}


