import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateComic } from './dto/create-comic.dto';
import { IComic } from './interfaces/comic.interface';
import { ICoverComic } from './interfaces/cover.interface';
import * as path from 'path';

@Injectable()
export class ComicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[IComic[], number]> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const comics = await this.prisma.getPrisma().comic.findMany({
      select: {
        id: true,
        title: true,
        genres: true,
        chapter: true,
        updateDay: true,
        cover: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      where: {
        userId,
        ...(query && { title: { contains: query, mode: 'insensitive' } }),
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
        cover: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
      where: { id, userId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  async create(userId: number, data: CreateComic): Promise<IComic> {
    return this.prisma.getPrisma().comic.create({
      data: {
        title: data.title,
        chapter: data.chapter,
        genres: { connect: data.genres.map((genreId) => ({ id: genreId })) },
        updateDay: data.updateDay,
        cover: data.cover ? { connect: { id: data.cover } } : undefined, // New field for cover image
        user: { connect: { id: userId } },
      },
      select: {
        id: true,
        title: true,
        chapter: true,
        genres: { select: { name: true } },
        updateDay: true,
        cover: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        }, // Include cover image in the response
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
        cover: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        }, // Include cover image in the response
      },
      where: { id, userId },
      data: {
        title: data.title,
        chapter: data.chapter,
        genres: { connect: data.genres.map((genreId) => ({ id: genreId })) },
        updateDay: data.updateDay,
        cover: { connect: { id: data.cover } }, // Update cover image
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

  async uploadFile(
    comicId: number,
    file: Express.Multer.File,
  ): Promise<ICoverComic> {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    const extWithDot = path.extname(file.originalname);
    const ext = extWithDot.substring(1);

    const savedFile = await this.prisma.getPrisma().coverFile.create({
      data: {
        name: file.filename,
        type: ext,
        size: file.size,
        url: '/uploads/cover-comic/' + file.filename,
        comic: { connect: { id: comicId } },
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
