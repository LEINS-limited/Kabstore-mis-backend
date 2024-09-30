import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';

@Controller()
export class AppController {
  @Get('home')
  greeting() {
    return 'Hello user 😀! Welcome to kabstore-mis';
  }
}
