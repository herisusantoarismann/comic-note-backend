// exception-log.service.ts

import { Injectable } from '@nestjs/common';
import { ExceptionLog } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getAllExceptionLogs(): Promise<
    [logs: ExceptionLog[], totalCount: number]
  > {
    const logs = await this.prisma.getPrisma().exceptionLog.findMany();

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
