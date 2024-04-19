// src/notification/notification.controller.ts

import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '@prisma/client'; // Sesuaikan dengan struktur model Prisma Anda

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Endpoint untuk mendapatkan semua notifikasi
  @Get()
  async getAllNotifications(@Req() request: any): Promise<Notification[]> {
    const user = request?.user;

    return this.notificationService.findAll(+user.id);
  }

  // Endpoint untuk membaca notifikasi individual berdasarkan ID
  @Patch(':id/read')
  async markNotificationAsRead(
    @Req() request: any,
    @Param('id') id: number,
  ): Promise<Notification> {
    const user = request?.user;

    return this.notificationService.markAsRead(+user.id, id);
  }

  // Endpoint untuk membaca semua notifikasi
  @Patch('readAll')
  async markAllNotificationsAsRead(@Req() request: any): Promise<void> {
    const user = request.user;

    await this.notificationService.markAllAsRead(user.id);
  }
}
