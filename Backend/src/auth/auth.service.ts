import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.usersService.create({
      name:data.name,
      password: hashed,
      email:data.email,
      role:data.role
    });
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      console.log("User info while logging in",user);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException();
      }

      const payload = { sub: user.id, role: user.role };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch(err){
      console.log(err);
      return "Some error occuredd";
    }
  }
}