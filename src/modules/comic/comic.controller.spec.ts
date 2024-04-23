import { Test, TestingModule } from '@nestjs/testing';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { NotFoundException } from '@nestjs/common';
import { CreateComic } from './dto/create-comic.dto';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ComicController', () => {
  let controller: ComicController;
  let service: ComicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComicController],
      providers: [
        ComicService,
        PrismaService,
        JwtService,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<ComicController>(ComicController);
    service = module.get<ComicService>(ComicService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of comics', async () => {
      const comics = [
        {
          id: 1,
          title: 'Comic 1',
          genre: 'Genre 1',
          chapter: 100,
          updateDay: 3,
          day: 'Thursday',
        },
        {
          id: 2,
          title: 'Comic 2',
          genre: 'Genre 2',
          chapter: 90,
          updateDay: 1,
          day: 'Tuesday',
        },
      ];
      const totalCount = 2;

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce([comics, totalCount]);

      const result = await controller.findAll(
        { user: { id: 1 } },
        'query',
        1,
        10,
      );

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual(comics);
      expect(result.totalPages).toEqual(1);
      expect(result.currentPage).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return a single comic', async () => {
      const comic = {
        id: 1,
        title: 'Comic 1',
        genre: 'Genre 1',
        chapter: 100,
        updateDay: 3,
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(comic);

      const result = await controller.findOne({ user: { id: 1 } }, '1');

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual({ ...comic, day: 'Thursday' });
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(
        controller.findOne({ user: { id: 1 } }, '999'),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new comic', async () => {
      const createComicDto: CreateComic = {
        title: 'New Comic',
        genre: 'Genre 1',
        chapter: 100,
        updateDay: 3,
      };
      const createdComic = { id: 1, ...createComicDto };

      jest.spyOn(service, 'create').mockResolvedValueOnce(createdComic);

      const result = await controller.create(
        { user: { id: 1 } },
        createComicDto,
      );

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual({
        ...createComicDto,
        day: 'Thursday',
        id: 1,
      });
    });
  });

  describe('update', () => {
    it('should update an existing comic', async () => {
      const updateComicDto: CreateComic = {
        title: 'Updated Comic',
        genre: 'Genre 1',
        chapter: 100,
        updateDay: 3,
      };
      const updatedComic = { id: 1, ...updateComicDto };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedComic);

      const result = await controller.update(
        { user: { id: 1 } },
        '1',
        updateComicDto,
      );

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual({
        ...updateComicDto,
        day: 'Thursday',
        id: 1,
      });
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(null);

      await expect(
        controller.update({ user: { id: 1 } }, '999', null),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an existing comic', async () => {
      const comic = {
        title: 'Updated Comic',
        genre: 'Genre 1',
        chapter: 100,
        updateDay: 3,
      };

      jest.spyOn(service, 'remove').mockResolvedValueOnce(comic);

      const result = await controller.remove({ user: { id: 1 } }, '1');

      expect(result.success).toBeTruthy();
      expect(result.message).toEqual('Comic successfully deleted.');
    });

    it('should throw NotFoundException if comic not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(null);

      await expect(
        controller.remove({ user: { id: 1 } }, '999'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
