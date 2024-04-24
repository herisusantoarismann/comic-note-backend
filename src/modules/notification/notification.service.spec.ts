import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../prisma.service';
import * as schedule from 'node-schedule';
import { NotFoundException } from '@nestjs/common';

jest.mock('node-schedule');

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, PrismaService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduleNotificationCheck', () => {
    it('should schedule job to check notifications', () => {
      const scheduleSpy = jest.spyOn(schedule, 'scheduleJob');
      service.scheduleNotificationCheck();
      expect(scheduleSpy).toHaveBeenCalledWith(
        '* 0 6 * * *',
        expect.any(Function),
      );
    });
  });

  describe('checkAndUpdateNotifications', () => {
    it('should check and update notifications', async () => {
      const mockComic = {
        id: 1,
        title: 'Comic 1',
        genre: 'Action',
        chapter: 1,
        updateDay: 1,
        created_at: new Date(),
        updated_at: new Date(),
        userId: 1,
      };
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const mockNotifications = [
        {
          id: 1,
          title: 'Notification 1',
          body: 'Body 1',
          userId: mockUser.id,
          read: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: 'Notification 2',
          body: 'Body 2',
          userId: mockUser.id,
          read: true,
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.getPrisma().comic, 'findMany')
        .mockResolvedValueOnce([mockComic]);
      jest
        .spyOn(prismaService.getPrisma().user, 'findMany')
        .mockResolvedValueOnce([mockUser]);
      jest
        .spyOn(prismaService.getPrisma().notification, 'create')
        .mockResolvedValueOnce(mockNotifications[0]);

      await service.checkAndUpdateNotifications();

      expect(prismaService.getPrisma().comic.findMany).toHaveBeenCalled();
      expect(prismaService.getPrisma().user.findMany).toHaveBeenCalledWith({
        where: { comics: { some: { id: mockComic.id } } },
      });
      expect(
        prismaService.getPrisma().notification.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            title: 'New Comic Update',
            body: `A new update for ${mockComic.title} is available!`,
            user: { connect: { id: mockUser.id } },
          },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return list of notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          title: 'Notification 1',
          body: 'Body 1',
          userId: 1,
          read: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: 'Notification 2',
          body: 'Body 2',
          userId: 1,
          read: true,
          createdAt: new Date(),
        },
      ];
      const mockTotalCount = 2;
      const userId = 1;

      jest
        .spyOn(prismaService.getPrisma().notification, 'findMany')
        .mockResolvedValueOnce(mockNotifications);
      jest
        .spyOn(prismaService.getPrisma().notification, 'count')
        .mockResolvedValueOnce(mockTotalCount);

      const result = await service.findAll(userId, 1, 10, '');

      expect(result).toEqual([mockNotifications, mockTotalCount]);
    });
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const mockNotification = {
        id: 1,
        title: 'Notification 1',
        body: 'Body 1',
        userId: 1,
        read: true,
        createdAt: new Date(),
      };
      const userId = 1;

      jest
        .spyOn(prismaService.getPrisma().notification, 'create')
        .mockResolvedValueOnce(mockNotification);

      const result = await service.createNotification(
        userId,
        'Notification 1',
        'Body 1',
      );

      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 1,
        title: 'Notification 1',
        body: 'Body 1',
        userId: 1,
        read: true,
        createdAt: new Date(),
      };
      const userId = 1;

      jest
        .spyOn(prismaService.getPrisma().notification, 'update')
        .mockResolvedValueOnce(mockNotification);

      const result = await service.markAsRead(1, userId);

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      jest
        .spyOn(prismaService.getPrisma().notification, 'update')
        .mockResolvedValueOnce(null);

      await expect(service.markAsRead(1, 1)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockCount = 3;
      const userId = 1;

      jest
        .spyOn(prismaService.getPrisma().notification, 'updateMany')
        .mockResolvedValueOnce({ count: mockCount });

      const result = await service.markAllAsRead(userId);

      expect(result).toEqual({ count: mockCount });
    });
  });
});
