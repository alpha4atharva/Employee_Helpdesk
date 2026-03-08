import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';
@Controller('users')
export class UsersController {

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user;
}
}