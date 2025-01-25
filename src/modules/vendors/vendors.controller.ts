import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDTO } from './dtos/vendors.dto';

@Controller('vendors')
@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
export class VendorsController {
  constructor(private readonly vendorService: VendorsService) {}

  @Get()
  findAll() {
    return this.vendorService.getVendors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.getVendorById(id);
  }

  @Post()
  create(@Body() createVendorDto: CreateVendorDTO) {
    return this.vendorService.create(createVendorDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: Partial<CreateVendorDTO>) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.delete(+id);
  }
}
