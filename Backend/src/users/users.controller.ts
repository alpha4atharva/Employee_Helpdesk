import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UsersService } from './users.service';
import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

// DTO for admin user creation
class AdminCreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}

// DTO for role update
class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // List all users (admin only)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Admin creates a new user
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createUser(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreateUser(dto);
  }

  // Admin deletes a user
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  // Admin changes a user's role
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role);
  }
}