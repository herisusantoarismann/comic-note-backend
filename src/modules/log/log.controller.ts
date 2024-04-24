// exception-log.controller.ts

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExceptionLog } from '@prisma/client';
import { LogService } from './log.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
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
    const [logs, totalCount] =
      await this.exceptionLogService.getAllExceptionLogs(
        +page,
        +pageSize,
        query,
      );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: logs,
      page,
      totalPages,
      currentPage: +page,
    };
  }

  @ApiOperation({ summary: 'Get logs detail' })
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
