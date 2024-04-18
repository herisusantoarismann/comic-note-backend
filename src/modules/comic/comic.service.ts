// comic.service.ts

import { Injectable } from '@nestjs/common';
import { Comic } from '.prisma/client';
import { CreateComic } from './dto/create-comic.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Comic[]> {
    return this.prisma.getPrisma().comic.findMany();
  }

  async findOne(id: number): Promise<Comic> {
    return this.prisma.getPrisma().comic.findUnique({ where: { id } });
  }

  async create(
    data: CreateComic,
  ): Promise<{
    title: string;
    genre: string;
    chapter: number;
    updateDay: number;
  }> {
    return this.prisma.getPrisma().comic.create({ data });
  }

  async update(id: number, data: CreateComic): Promise<Comic> {
    return this.prisma.getPrisma().comic.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Comic> {
    return this.prisma.getPrisma().comic.delete({ where: { id } });
  }
}
