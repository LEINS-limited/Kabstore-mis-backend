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
import { CustomersService } from './customers.service';
import { CreateCustomerDTO } from './dtos/customers.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiResponse } from 'src/common/payload/ApiResponse';

@Controller('customers')
@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@Public()
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Get()
  findAll() {
    return this.customerService.getCustomers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return new ApiResponse(
      true,
      null,
     await  this.customerService.getCustomerById(id),
    );
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDTO) {
    return new ApiResponse(true, "Customer saved successfully!", await this.customerService.create(createCustomerDto));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: Partial<CreateCustomerDTO>,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.delete(id);
  }
}
