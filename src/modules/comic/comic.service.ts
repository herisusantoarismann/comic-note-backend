// comic.service.ts

import { Injectable } from '@nestjs/common';
import { Comic } from '.prisma/client';
import { CreateComic } from './dto/create-comic.dto';
import { PrismaService } from 'src/prisma.service';

interface IComic {
  title: string;
  genre: string;
  chapter: number;
  updateDay: number;
}

@Injectable()
export class ComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<IComic[]> {
    return this.prisma.getPrisma().comic.findMany({
      select: {
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
    });
  }

  async findOne(id: number): Promise<IComic> {
    return this.prisma.getPrisma().comic.findUnique({
      select: {
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
      where: { id },
    });
  }

  async create(data: CreateComic): Promise<{
    title: string;
    genre: string;
    chapter: number;
    updateDay: number;
  }> {
    return this.prisma.getPrisma().comic.create({ data });
  }

  async update(id: number, data: CreateComic): Promise<IComic> {
    return this.prisma.getPrisma().comic.update({
      select: {
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<IComic> {
    return this.prisma
      .getPrisma()
      .comic.delete({
        select: { title: true, genre: true, chapter: true, updateDay: true },
        where: { id },
      });
  }
}
