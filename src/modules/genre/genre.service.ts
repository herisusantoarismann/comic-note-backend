// genre.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IGenre } from './interaces/genre.interface';
import { CreateGenre } from './dto/create-genre.dto';
import { UpdateGenre } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[genres: IGenre[], totalCount: number]> {
    const skip = Number(pageSize) ? (page - 1) * pageSize : 0;
    const take = Number(pageSize) ? pageSize : 10;

    const where = query ? { name: { contains: query } } : {};

    const [genres, totalCount] = await Promise.all([
      this.prisma.getPrisma().genre.findMany({
        where,
        skip,
        take,
      }),
      this.prisma.getPrisma().genre.count(),
    ]);

    return [genres, totalCount];
  }

  async findOne(id: number): Promise<IGenre | null> {
    return this.prisma.getPrisma().genre.findUnique({
      where: { id },
    });
  }

  async create(data: CreateGenre): Promise<IGenre> {
    return this.prisma.getPrisma().genre.create({
      data,
    });
  }

  async update(id: number, data: UpdateGenre): Promise<IGenre> {
    const genre = await this.findOne(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return this.prisma.getPrisma().genre.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<IGenre> {
    const genre = await this.findOne(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return this.prisma.getPrisma().genre.delete({
      where: { id },
    });
  }

  async selectData(): Promise<IGenre[]> {
    return this.prisma.getPrisma().genre.findMany();
  }
}
