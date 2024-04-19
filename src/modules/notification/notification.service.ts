// src/notification/notification.service.ts

import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import * as schedule from 'node-schedule';
import { PrismaService } from 'src/prisma.service';

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
        where: { comic: { some: { id: comic.id } } },
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

  async findAll(userId: number): Promise<Notification[]> {
    return this.prisma.getPrisma().notification.findMany({
      where: { userId },
    });
  }

  async createNotification(
    userId: number,
    title: string,
    body: string,
  ): Promise<Notification> {
    return this.prisma.getPrisma().notification.create({
      data: {
        title,
        body,
        user: { connect: { id: userId } }, // Menghubungkan notifikasi dengan pengguna yang bersangkutan
      },
    });
  }

  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    return this.prisma.getPrisma().notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.prisma.getPrisma().notification.updateMany({
      data: { read: true },
      where: { userId, read: false },
    });
  }
}