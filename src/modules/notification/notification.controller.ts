// src/notification/notification.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '@prisma/client'; // Sesuaikan dengan struktur model Prisma Anda
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Endpoint untuk mendapatkan semua notifikasi
  @ApiOperation({ summary: 'Get all notifications' })
  @Get()
  @ApiQuery({
    name: 'query',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @CacheKey('notifications')
  async getAllNotifications(
    @Req() request: any,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    sucess: Boolean;
    data: Notification[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    const user = request?.user;

    const [notifications, totalCount] = await this.notificationService.findAll(
      +user.id,
      +page ?? 1,
      +pageSize ?? 10,
      query,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      sucess: true,
      data: notifications,
      page,
      totalPages,
      currentPage: +page,
    };
  }

  // Endpoint untuk membaca notifikasi individual berdasarkan ID
  @ApiOperation({ summary: 'Read spesific notification' })
  @Patch(':id/read')
  async markNotificationAsRead(
    @Req() request: any,
    @Param('id') id: number,
  ): Promise<Notification> {
    const user = request?.user;

    return this.notificationService.markAsRead(+user.id, id);
  }

  // Endpoint untuk membaca semua notifikasi
  @ApiOperation({ summary: 'Read all notifications' })
  @Patch('readAll')
  async markAllNotificationsAsRead(@Req() request: any): Promise<void> {
    const user = request.user;

    await this.notificationService.markAllAsRead(user.id);
  }
}
