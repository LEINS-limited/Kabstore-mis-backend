import { ApiProperty } from '@nestjs/swagger';
import {
  IsString
} from 'class-validator';


export class CreateVendorDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  contactNumber: string;

  @ApiProperty()
  location: string;
}


