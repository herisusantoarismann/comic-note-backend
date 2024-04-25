// src/notification/notification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import * as schedule from 'node-schedule';
import { PrismaService } from '../../prisma.service';
import { INotification } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {
    this.scheduleNotificationCheck();
  }

  async scheduleNotificationCheck(): Promise<void> {
    // Atur pengecekan notifikasi setiap jam 6 pagi
    schedule.scheduleJob('* 0 6 * * *', async () => {
      await this.checkAndUpdateNotifications();
    });
  }

  async checkAndUpdateNotifications(): Promise<void> {
    // Dapatkan daftar komik yang diperbarui pada hari ini
    const updatedComics = await this.prisma.getPrisma().comic.findMany({
      where: { updateDay: new Date().getDay() },
    });

    // Dapatkan daftar pengguna yang menyukai komik yang diperbarui
    for (const comic of updatedComics) {
      const users = await this.prisma.getPrisma().user.findMany({
        where: { comics: { some: { id: comic.id } } },
      });

      // Kirim notifikasi ke setiap pengguna yang menyukai komik yang diperbarui
      for (const user of users) {
        await this.createNotification(
          user.id,
          'New Comic Update',
          `A new update for ${comic.title} is available!`,
        );
      }
    }
  }

  async findAll(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[Notification[], number]> {
    const skip = Number(pageSize) ? (page - 1) * pageSize : 0;
    const take = Number(pageSize) ? pageSize : 10;

    const notifications = await this.prisma.getPrisma().notification.findMany({
      where: { userId, ...(query && { title: { contains: query } }) },
      skip,
      take,
    });

    const totalCount = await this.prisma.getPrisma().notification.count({
      where: {
        userId,
      },
    });

    return [notifications, totalCount];
  }

  async createNotification(
    userId: number,
    title: string,
    body: string,
  ): Promise<Notification> {
    const notification = await this.prisma.getPrisma().notification.create({
      data: {
        title,
        body,
        user: { connect: { id: userId } }, // Menghubungkan notifikasi dengan pengguna yang bersangkutan
      },
    });

    return notification;
  }

  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<INotification> {
    const notification = await this.prisma.getPrisma().notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
      select: {
        id: true,
        title: true,
        body: true,
        read: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: number): Promise<{ count: number }> {
    return this.prisma.getPrisma().notification.updateMany({
      data: { read: true },
      where: { userId, read: false },
    });
  }
}
