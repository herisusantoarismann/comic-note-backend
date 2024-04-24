import { Test, TestingModule } from '@nestjs/testing';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('LogController', () => {
  let controller: LogController;
  let logService: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogController],
      providers: [LogService, PrismaService, JwtService],
    }).compile();

    controller = module.get<LogController>(LogController);
    logService = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLogs', () => {
    it('should return list of logs', async () => {
      const mockLogs = [
        {
          id: 1,
          message: 'Log 1',
          stackTrace: 'stack trace 1',
          timestamp: new Date(),
        },
        {
          id: 2,
          message: 'Log 2',
          stackTrace: 'stack trace 2',
          timestamp: new Date(),
        },
      ];
      const totalCount = mockLogs.length;

      jest
        .spyOn(logService, 'getAllExceptionLogs')
        .mockResolvedValueOnce([mockLogs, totalCount]);

      const result = await controller.getAllLogs(undefined, 1, 10);

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual(mockLogs);
      expect(result.page).toEqual(1);
      expect(result.totalPages).toEqual(1);
      expect(result.currentPage).toEqual(1);
    });
  });

  describe('getExceptionLogById', () => {
    it('should return log by ID', async () => {
      const mockLog = {
        id: 1,
        message: 'Log 1',
        stackTrace: 'stack trace 1',
        timestamp: new Date(),
      };

      jest
        .spyOn(logService, 'getExceptionLogById')
        .mockResolvedValueOnce(mockLog);

      const result = await controller.getExceptionLogById(1);

      expect(result.success).toBeTruthy();
      expect(result.data).toEqual(mockLog);
    });

    it('should throw NotFoundException if log not found', async () => {
      jest.spyOn(logService, 'getExceptionLogById').mockResolvedValueOnce(null);

      await expect(controller.getExceptionLogById(1)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
