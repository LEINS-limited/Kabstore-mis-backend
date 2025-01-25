import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus } from '@nestjs/common';
import { GeneralStoreInfoService } from './general-store-info.service';
import { CreateGeneralStoreInfoDto, UpdateGeneralStoreInfoDto } from '../../common/dtos/general-store-info.dto';
import { GeneralStoreInfo } from '../../entities/general-store-info.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('general-store-info')
@Controller('general-store-info')
@ApiBearerAuth('JWT-auth')
export class GeneralStoreInfoController {
  constructor(private readonly generalStoreInfoService: GeneralStoreInfoService) {}

  @Post()
  @ApiOperation({ summary: 'Create general store info' })
  @ApiResponse({ status: HttpStatus.CREATED, type: GeneralStoreInfo })
  async create(@Body() createDto: CreateGeneralStoreInfoDto): Promise<GeneralStoreInfo> {
    return await this.generalStoreInfoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all general store info' })
  @ApiResponse({ status: HttpStatus.OK, type: [GeneralStoreInfo] })
  async findAll(): Promise<GeneralStoreInfo[]> {
    return await this.generalStoreInfoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get general store info by id' })
  @ApiResponse({ status: HttpStatus.OK, type: GeneralStoreInfo })
  async findOne(@Param('id') id: string): Promise<GeneralStoreInfo> {
    return await this.generalStoreInfoService.findOne(id);
  }

  @Put('')
  @ApiOperation({ summary: 'Update general store info' })
  @ApiResponse({ status: HttpStatus.OK, type: GeneralStoreInfo })
  async update(
    @Body() updateDto: UpdateGeneralStoreInfoDto,
  ): Promise<GeneralStoreInfo> {
    return await this.generalStoreInfoService.update(updateDto);
  }
  
  @Delete()
  @ApiOperation({ summary: 'Delete general store info' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(): Promise<void> {
    await this.generalStoreInfoService.remove();
  }
} 