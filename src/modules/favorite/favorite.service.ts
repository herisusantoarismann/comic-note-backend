// favorite-comic.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IFavoriteComic } from './interfaces/favorite.interface';

@Injectable()
export class FavoriteComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[IFavoriteComic[], number]> {
    const skip = Number(page) ? (page - 1) * pageSize : 0;
    const take = Number(pageSize) ? pageSize : 10;

    const favoriteComics = await this.prisma
      .getPrisma()
      .favoriteComic.findMany({
        where: {
          userId: userId,
          ...(query && { comic: { title: { contains: query } } }),
        },
        select: {
          id: true,
          comic: {
            select: {
              id: true,
              title: true,
              genres: { select: { id: true, name: true } },
              chapter: true,
              updateDay: true,
              cover: { select: { id: true, name: true, url: true } },
            },
          },
        },
        skip,
        take,
      });

    const totalCount = await this.prisma.getPrisma().favoriteComic.count({
      where: {
        userId,
      },
    });

    return [favoriteComics, totalCount];
  }

  async create(userId: number, comicId: number): Promise<IFavoriteComic> {
    const comic = await this.prisma.getPrisma().comic.findFirst({
      where: {
        id: comicId,
      },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    const existingFavorite = await this.prisma
      .getPrisma()
      .favoriteComic.findFirst({
        where: {
          AND: [{ userId }, { comicId }],
        },
      });

    if (existingFavorite) {
      throw new BadRequestException('Favorite comic already exists');
    }

    return this.prisma.getPrisma().favoriteComic.create({
      data: {
        userId,
        comicId,
      },
      select: {
        id: true,
        comic: {
          select: {
            id: true,
            title: true,
            genres: { select: { id: true, name: true } },
            chapter: true,
            updateDay: true,
            cover: { select: { id: true, name: true, url: true } },
          },
        },
      },
    });
  }

  async remove(id: number): Promise<IFavoriteComic> {
    const favoriteComic = await this.prisma
      .getPrisma()
      .favoriteComic.findUnique({
        where: {
          id,
        },
      });

    if (!favoriteComic) {
      throw new NotFoundException('Favorite comic not found');
    }

    await this.prisma.getPrisma().favoriteComic.delete({
      where: {
        id,
      },
    });

    return favoriteComic;
  }
}
