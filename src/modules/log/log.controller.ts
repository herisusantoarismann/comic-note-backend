// exception-log.controller.ts

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExceptionLog } from '@prisma/client';
import { LogService } from './log.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { LogListSchema, LogSchema } from './schemas/log.schema';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags('Logs')
@Controller('logs')
export class LogController {
  constructor(private readonly exceptionLogService: LogService) {}

  @ApiOperation({ summary: 'Get list logs' })
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
        data: LogListSchema,
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
        currentPage: { type: 'number', example: 1 },
      },
    },
  })
  @CacheKey('logs')
  @Get()
  async getAllLogs(
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: ExceptionLog[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    page = Number.isInteger(+page) ? page : 1;
    pageSize = Number.isInteger(+pageSize) ? pageSize : 10;

    const [logs, totalCount] =
      await this.exceptionLogService.getAllExceptionLogs(
        +page,
        +pageSize,
        query,
      );

    const totalPages = Math.ceil(totalCount / pageSize) ?? 1;

    return {
      success: true,
      data: logs,
      page,
      totalPages,
      currentPage: +page,
    };
  }

  @ApiOperation({ summary: 'Get logs detail' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: LogSchema,
      },
    },
  })
  @CacheKey('log')
  @Get(':id')
  async getExceptionLogById(
    @Param('id') id: number,
  ): Promise<{ success: boolean; data: ExceptionLog }> {
    const log = await this.exceptionLogService.getExceptionLogById(id);

    if (!log) {
      throw new NotFoundException('Log not found');
    }

    return {
      success: true,
      data: log,
    };
  }
}
