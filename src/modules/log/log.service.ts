// exception-log.service.ts

import { Injectable } from '@nestjs/common';
import { ExceptionLog } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {
    // Menangani uncaught exception
    process.on('uncaughtException', (error: Error) => {
      this.createExceptionLog('Uncaught exception', error.message);
    });

    // Menangani unhandled rejection
    process.on('unhandledRejection', (reason: any) => {
      this.createExceptionLog('Unhandled rejection', reason.toString());
    });
  }

  async createExceptionLog(
    message: string,
    stackTrace: string,
  ): Promise<ExceptionLog> {
    return this.prisma.getPrisma().exceptionLog.create({
      data: {
        message,
        stackTrace,
      },
    });
  }

  async getAllExceptionLogs(
    page: number = 1,
    pageSize: number = 10,
    query: string,
  ): Promise<[logs: ExceptionLog[], totalCount: number]> {
    const skip = Number.isInteger(page) ? (page - 1) * pageSize : 0;
    const take = Number.isInteger(pageSize) ? pageSize : 10;

    const logs = await this.prisma.getPrisma().exceptionLog.findMany({
      where: {
        ...(query && { message: { contains: query } }),
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.getPrisma().exceptionLog.count();

    return [logs, totalCount];
  }

  async getExceptionLogById(id: number): Promise<ExceptionLog | null> {
    return this.prisma.getPrisma().exceptionLog.findUnique({
      where: {
        id,
      },
    });
  }
}
