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
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '@prisma/client'; // Sesuaikan dengan struktur model Prisma Anda
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { INotification } from './interfaces/notification.interface';
import {
  NotificationListSchema,
  NotificationSchema,
} from './schema/notification.schema';

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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: NotificationListSchema,
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
        currentPage: { type: 'number', example: 1 },
      },
    },
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
    page = Number.isInteger(+page) ? page : 1;
    pageSize = Number.isInteger(+pageSize) ? pageSize : 10;

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

  @ApiOperation({ summary: 'Read spesific notification' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: NotificationSchema,
      },
    },
  })
  @Patch(':id/read')
  async markNotificationAsRead(
    @Req() request: any,
    @Param('id') id: number,
  ): Promise<{ success: Boolean; data: INotification }> {
    const user = request?.user;

    const notification = await this.notificationService.markAsRead(
      +user.id,
      id,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return {
      success: true,
      data: notification,
    };
  }

  // Endpoint untuk membaca semua notifikasi
  @ApiOperation({ summary: 'Read all notifications' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string', example: '10 data affected' },
      },
    },
  })
  @Patch('readAll')
  async markAllNotificationsAsRead(@Req() request: any): Promise<{
    success: true;
    message: string;
  }> {
    const user = request.user;

    const { count } = await this.notificationService.markAllAsRead(user.id);

    return {
      success: true,
      message: `${count} data affected`,
    };
  }
}
