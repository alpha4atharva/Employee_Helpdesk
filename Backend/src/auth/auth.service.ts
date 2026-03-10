import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      name: data.name,
      password: hashed,
      email: data.email,
      role: data.role
    });

    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAvailable: user.isAvailable,
        activeTicketsCount: user.activeTicketsCount,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAvailable: user.isAvailable,
        activeTicketsCount: user.activeTicketsCount,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAvailable: user.isAvailable,
      activeTicketsCount: user.activeTicketsCount,
    };
  }
}