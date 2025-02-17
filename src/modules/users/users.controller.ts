/* eslint-disable */
/*
 @auhor : © 2024 Valens Niyonsenga <valensniyonsenga2003@gmail.com>
*/

/**
 * @file
 * @brief controller for user queries
 */
import {
  Controller,
  Param,
  Delete,
  Get,
  Body,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UUID } from 'crypto';
import { ApiResponse } from 'src/common/payload/ApiResponse';
import { Public } from 'src/decorators/public.decorator';
import { UpdateUserDto } from 'src/common/dtos/update-user.dto';
import { CreateAdminDto } from 'src/common/dtos/create-admin.dto';
import { CreateUserByAdminDto, CreateUserDto } from 'src/common/dtos/create-user.dto';
@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/all')
  @Roles('ADMIN')
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get('/user-performance/:userId')
  getUserPerformance(@Param('userId') userId: UUID, @Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.usersService.getUserPerformance(userId, startDate, endDate);
  }

  @Get('/:id')
  @Roles('ADMIN')
  async getUserById(@Param('id') id: UUID) {
    const user = await this.usersService.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Public()
  @Post('/create/admin')
  @Roles('ADMIN')
  @ApiBody({ type: CreateAdminDto })
  createAdminAccount(@Body() body: CreateAdminDto) {
    return this.usersService.createAdmin(body);
  }

  @Public()
  @Post('/create/user')
  @ApiBody({ type: CreateUserByAdminDto })
  @Roles('ADMIN')
  createUserAccount(@Body() body: CreateUserByAdminDto) {
    return this.usersService.createUser(body);
  }

  @Patch('update/:id')
  @Roles('ADMIN')
  @ApiBody({ type: UpdateUserDto })
  updateUser(@Param('id') id: UUID, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(id, body);
  }

  @Patch('/{assign-role}/:userId/:roleName/:userType')
  @Roles('ADMIN')
  async assignRoleToUser(
    @Param('userId') userId: UUID,
    @Param('roleName') roleName: any,
    @Param('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'The role has been assigned successfully',
      await this.usersService.assignRoleToUser(userId, roleName, userType),
    );
  }

  @Delete('delete/:id')
  @Roles('ADMIN')
  deleteUser(@Param('id') id: UUID) {
    return this.usersService.deleteUser(id);
  }
}
