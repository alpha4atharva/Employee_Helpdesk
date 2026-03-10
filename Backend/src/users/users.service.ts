import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findAll() {
    return this.userRepo.find();
  }

  findAgents() {
    return this.userRepo.find({
      where: { role: Role.IT_AGENT, isAvailable: true },
    });
  }

  /**
   * Admin creates a new user with a hashed password.
   */
  async adminCreateUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });
    const saved = await this.userRepo.save(user);
    // Return without password
    const { password, ...result } = saved;
    return result;
  }

  /**
   * Delete a user by ID.
   */
  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }

  /**
   * Update a user's role.
   */
  async updateRole(id: number, role: Role) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    const saved = await this.userRepo.save(user);
    const { password, ...result } = saved;
    return result;
  }
}