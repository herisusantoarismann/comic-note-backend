// user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { IUser } from './interfaces/user.interface';
import { IProfilePic } from './interfaces/profile-pic.interfaces';
import * as path from 'path';

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
        profilePic: { select: { id: true, name: true, url: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUser): Promise<IUser> {
    const { name, email, password, profilePicId } = createUserDto;
    return this.prisma.getPrisma().user.create({
      data: {
        name,
        email,
        password,
        profilePic: { connect: { id: profilePicId } },
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

    const { name, profilePicId } = updateUserDto;
    return this.prisma.getPrisma().user.update({
      where: { id },
      data: {
        name,
        profilePic: { connect: { id: profilePicId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: { select: { id: true, name: true, url: true } },
      },
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

  async uploadFile(
    userId: number,
    file: Express.Multer.File,
  ): Promise<IProfilePic> {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    const extWithDot = path.extname(file.originalname);
    const ext = extWithDot.substring(1);

    const savedFile = await this.prisma.getPrisma().profilePicFile.create({
      data: {
        name: file.filename,
        type: ext,
        size: file.size,
        url: '/uploads/profile-pic/' + file.filename,
        user: { connect: { id: userId } },
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        url: true,
      },
    });

    if (!savedFile) {
      throw new NotFoundException('File failed to upload');
    }

    return savedFile;
  }
}
