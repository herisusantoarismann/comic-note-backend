// comic.service.ts

import { Injectable } from '@nestjs/common';
import { Comic } from '.prisma/client';
import { CreateComic } from './dto/create-comic.dto';
import { PrismaService } from 'src/prisma.service';
import { convertDay } from 'src/common/helpers/convertDay';

interface IComic {
  title: string;
  genre: string;
  chapter: number;
  updateDay: number;
}

@Injectable()
export class ComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(id: string): Promise<IComic[]> {
    return this.prisma.getPrisma().comic.findMany({
      select: {
        id: true,
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
      where: {
        idPengguna: Number(id),
      },
    });
  }

  async findOne(idUser: number, id: number): Promise<IComic> {
    return this.prisma.getPrisma().comic.findUnique({
      select: {
        id: true,
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
      where: { id: id, idPengguna: idUser },
    });
  }

  async create(
    id: string,
    data: CreateComic,
  ): Promise<{
    title: string;
    genre: string;
    chapter: number;
    updateDay: number;
  }> {
    return this.prisma.getPrisma().comic.create({
      data: {
        title: data?.title,
        chapter: data?.chapter,
        genre: data?.genre,
        updateDay: data?.updateDay,
        idPengguna: Number(id),
      },
      select: {
        title: true,
        chapter: true,
        genre: true,
        updateDay: true,
      },
    });
  }

  async update(idUser: number, id: number, data: CreateComic): Promise<IComic> {
    return this.prisma.getPrisma().comic.update({
      select: {
        id: true,
        title: true,
        genre: true,
        chapter: true,
        updateDay: true,
      },
      where: { id: id, idPengguna: idUser },
      data,
    });
  }

  async remove(idUser: number, id: number): Promise<IComic> {
    return this.prisma.getPrisma().comic.delete({
      where: { id: id, idPengguna: idUser },
    });
  }
}
