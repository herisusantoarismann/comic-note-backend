import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(name: string, email: string, password: string): Promise<User> {
    return this.prisma.getPrisma().user.create({
      data: {
        name,
        email,
        password,
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
