import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(name: string, email: string, password: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.getPrisma().user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.getPrisma().user.findUnique({
      where: {
        email,
      },
    });
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
