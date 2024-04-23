// user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { IUser } from '../auth/interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[IUser[], number]> {
    const skip = Number.isInteger(page) ? (page - 1) * pageSize : 0;
    const take = Number.isInteger(pageSize) ? pageSize : 10;

    const users = await this.prisma.getPrisma().user.findMany({
      where: {
        ...((query && { name: { contains: query } }) || {
          email: { contains: query },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.getPrisma().user.count();

    return [users, totalCount];
  }

  async findOne(id: number): Promise<IUser> {
    const user = await this.prisma.getPrisma().user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUser): Promise<IUser> {
    const { name, email, password } = createUserDto;
    return this.prisma.getPrisma().user.create({
      data: {
        name,
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUser): Promise<IUser> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const { name, email } = updateUserDto;
    return this.prisma.getPrisma().user.update({
      where: { id },
      data: {
        name,
        email,
      },
      select: { id: true, name: true, email: true },
    });
  }

  async remove(id: number): Promise<IUser> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return this.prisma.getPrisma().user.delete({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }
}
