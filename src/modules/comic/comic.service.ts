import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateComic } from './dto/create-comic.dto';
import { IComic } from './interfaces/comic.interface';

@Injectable()
export class ComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[IComic[], number]> {
    const skip = Number(page) ? (page - 1) * pageSize : 1;
    const take = Number(pageSize) ? pageSize : 1;

    const comics = await this.prisma.getPrisma().comic.findMany({
      select: {
        id: true,
        title: true,
        genres: true,
        chapter: true,
        updateDay: true,
      },
      where: {
        userId,
        ...(query && { title: { contains: query } }),
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.getPrisma().comic.count({
      where: {
        userId,
      },
    });

    return [comics, totalCount];
  }

  async findOne(userId: number, id: number): Promise<any> {
    const comic = await this.prisma.getPrisma().comic.findUnique({
      select: {
        id: true,
        title: true,
        genres: true,
        chapter: true,
        updateDay: true,
      },
      where: { id, userId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  async create(userId: number, data: CreateComic): Promise<any> {
    return this.prisma.getPrisma().comic.create({
      data: {
        title: data.title,
        chapter: data.chapter,
        genres: { connect: data.genres.map((genreId) => ({ id: genreId })) },
        updateDay: data.updateDay,
        cover: data.cover, // New field for cover image
        user: { connect: { id: userId } },
      },
      select: {
        title: true,
        chapter: true,
        genres: { select: { name: true } },
        updateDay: true,
        cover: true, // Include cover image in the response
      },
    });
  }

  async update(userId: number, id: number, data: CreateComic): Promise<any> {
    const comic = await this.findOne(userId, id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return this.prisma.getPrisma().comic.update({
      select: {
        id: true,
        title: true,
        genres: { select: { name: true } },
        chapter: true,
        updateDay: true,
        cover: true, // Include cover image in the response
      },
      where: { id, userId },
      data: {
        title: data.title,
        chapter: data.chapter,
        genres: { connect: data.genres.map((genreId) => ({ id: genreId })) },
        updateDay: data.updateDay,
        cover: data.cover, // Update cover image
        user: { connect: { id: userId } },
      },
    });
  }

  async remove(userId: number, id: number): Promise<any> {
    const comic = await this.findOne(userId, id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return this.prisma.getPrisma().comic.delete({
      where: { id, userId },
    });
  }
}
