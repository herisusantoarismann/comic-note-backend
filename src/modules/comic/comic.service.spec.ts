import { Test, TestingModule } from '@nestjs/testing';
import { ComicService } from './comic.service';
import { PrismaService } from '../../prisma.service';
import { CreateComic } from './dto/create-comic.dto';
import { NotFoundException } from '@nestjs/common';

describe('ComicService', () => {
  let service: ComicService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComicService, PrismaService],
    }).compile();

    service = module.get<ComicService>(ComicService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of comics', async () => {
      const mockComics = [
        {
          id: 1,
          title: 'Comic 1',
          genre: 'Action',
          chapter: 1,
          updateDay: 1,
          created_at: new Date(),
          userId: 1,
          updated_at: new Date(),
        },
      ];
      jest
        .spyOn(prismaService.getPrisma().comic, 'findMany')
        .mockResolvedValueOnce(mockComics);
      jest
        .spyOn(prismaService.getPrisma().comic, 'count')
        .mockResolvedValueOnce(mockComics.length);

      const userId = '1';
      const [result, totalCount] = await service.findAll(
        userId,
        1,
        10,
        'query',
      );

      expect(result).toEqual(mockComics);
      expect(totalCount).toEqual(mockComics.length);
    });
  });

  describe('findOne', () => {
    it('should return a comic', async () => {
      const mockComic = {
        id: 1,
        title: 'Comic 1',
        genre: 'Action',
        chapter: 1,
        updateDay: 1,
        created_at: new Date(),
        userId: 1,
        updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.getPrisma().comic, 'findUnique')
        .mockResolvedValueOnce(mockComic);

      const userId = 1;
      const comicId = 1;
      const result = await service.findOne(userId, comicId);

      expect(result).toEqual(mockComic);
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest
        .spyOn(prismaService.getPrisma().comic, 'findUnique')
        .mockResolvedValueOnce(null);

      const userId = 1;
      const comicId = 1;

      await expect(service.findOne(userId, comicId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a comic', async () => {
      const createComicDto: CreateComic = {
        title: 'Comic 1',
        genre: 'Action',
        chapter: 1,
        updateDay: 1,
      };
      const userId = '1';
      const mockCreatedComic = {
        id: 1,
        ...createComicDto,
        created_at: new Date(),
        userId: 1,
        updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.getPrisma().comic, 'create')
        .mockResolvedValueOnce(mockCreatedComic);

      const result = await service.create(userId, createComicDto);

      expect(result).toEqual(mockCreatedComic);
    });
  });

  describe('update', () => {
    it('should update a comic', async () => {
      const updateComicDto: CreateComic = {
        title: 'Updated Comic 1',
        genre: 'Adventure',
        chapter: 2,
        updateDay: 2,
      };
      const userId = 143;
      const comicId = 1;
      const mockUpdatedComic = {
        id: comicId,
        ...updateComicDto,
        created_at: new Date(),
        userId: 1,
        updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.getPrisma().comic, 'update')
        .mockResolvedValueOnce(mockUpdatedComic);

      const result = await service.update(userId, comicId, updateComicDto);

      expect(result).toEqual(mockUpdatedComic);
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest
        .spyOn(prismaService.getPrisma().comic, 'update')
        .mockResolvedValueOnce(null);

      const userId = 143;
      const comicId = 9999;
      const updateComicDto: CreateComic = {
        title: 'Updated Comic 1',
        genre: 'Adventure',
        chapter: 2,
        updateDay: 2,
      };

      await expect(
        service.update(userId, comicId, updateComicDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a comic', async () => {
      const userId = 143;
      const comicId = 1;
      const mockDeletedComic = {
        id: comicId,
        title: 'Deleted Comic 1',
        genre: 'Action',
        chapter: 1,
        updateDay: 1,
        created_at: new Date(),
        userId: 1,
        updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.getPrisma().comic, 'delete')
        .mockResolvedValueOnce(mockDeletedComic);

      const result = await service.remove(userId, comicId);

      expect(result).toEqual(mockDeletedComic);
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest
        .spyOn(prismaService.getPrisma().comic, 'delete')
        .mockResolvedValueOnce(null);

      const userId = 143;
      const comicId = 99999;

      await expect(service.remove(userId, comicId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
