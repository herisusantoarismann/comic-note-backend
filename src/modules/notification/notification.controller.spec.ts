import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            findAll: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
        JwtService,
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllNotifications', () => {
    it('should return list of notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          title: 'Notification 1',
          body: 'Body 1',
          read: false,
          createdAt: new Date(),
          userId: 1,
        },
        {
          id: 2,
          title: 'Notification 2',
          body: 'Body 2',
          read: false,
          createdAt: new Date(),
          userId: 1,
        },
      ];
      const mockTotalCount = 2;
      const userId = 1;

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce([mockNotifications, mockTotalCount]);

      const result = await controller.getAllNotifications(
        { user: { id: userId } },
        '',
        1,
        10,
      );

      expect(result.sucess).toBe(true);
      expect(result.data).toEqual(mockNotifications);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 1,
        title: 'Notification 1',
        body: 'Body 1',
        read: false,
        createdAt: new Date(),
        userId: 1,
      };
      const userId = 1;

      jest.spyOn(service, 'markAsRead').mockResolvedValueOnce(mockNotification);

      const result = await controller.markNotificationAsRead(
        { user: { id: userId } },
        1,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      const userId = 1;

      jest.spyOn(service, 'markAsRead').mockResolvedValueOnce(null);

      await expect(
        controller.markNotificationAsRead({ user: { id: userId } }, 1),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 1;
      const mockCount = 3;

      jest
        .spyOn(service, 'markAllAsRead')
        .mockResolvedValueOnce({ count: mockCount });

      const result = await controller.markAllNotificationsAsRead({
        user: { id: userId },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(`${mockCount} data affected`);
    });
  });
});
