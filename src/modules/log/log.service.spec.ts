import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from './log.service';
import { PrismaService } from '../../prisma.service';
import { ExceptionLog } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('LogService', () => {
  let service: LogService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogService, PrismaService],
    }).compile();

    service = module.get<LogService>(LogService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExceptionLog', () => {
    it('should create an exception log', async () => {
      const message = 'Test message';
      const stackTrace = 'Test stack trace';

      const mockCreatedLog: ExceptionLog = {
        id: 1,
        message,
        stackTrace,
        timestamp: new Date(),
      };

      jest
        .spyOn(prismaService.getPrisma().exceptionLog, 'create')
        .mockResolvedValueOnce(mockCreatedLog);

      const result = await service.createExceptionLog(message, stackTrace);

      expect(result).toEqual(mockCreatedLog);
    });
  });

  describe('getAllExceptionLogs', () => {
    it('should return list of exception logs', async () => {
      const mockLogs: ExceptionLog[] = [
        {
          id: 1,
          message: 'Log 1',
          stackTrace: 'Stack trace 1',
          timestamp: new Date(),
        },
        {
          id: 2,
          message: 'Log 2',
          stackTrace: 'Stack trace 2',
          timestamp: new Date(),
        },
      ];
      const totalCount = mockLogs.length;

      jest
        .spyOn(prismaService.getPrisma().exceptionLog, 'findMany')
        .mockResolvedValueOnce(mockLogs);
      jest
        .spyOn(prismaService.getPrisma().exceptionLog, 'count')
        .mockResolvedValueOnce(totalCount);

      const [result, resultTotalCount] = await service.getAllExceptionLogs(
        1,
        10,
        '',
      );

      expect(result).toEqual(mockLogs);
      expect(resultTotalCount).toEqual(totalCount);
    });
  });

  describe('getExceptionLogById', () => {
    it('should return exception log by ID', async () => {
      const id = 1;
      const mockLog: ExceptionLog = {
        id,
        message: 'Log 1',
        stackTrace: 'Stack trace 1',
        timestamp: new Date(),
      };

      jest
        .spyOn(prismaService.getPrisma().exceptionLog, 'findUnique')
        .mockResolvedValueOnce(mockLog);

      const result = await service.getExceptionLogById(id);

      expect(result).toEqual(mockLog);
    });

    it('should return null if log not found', async () => {
      const id = 1;

      jest
        .spyOn(prismaService.getPrisma().exceptionLog, 'findUnique')
        .mockResolvedValueOnce(null);

      const result = await service.getExceptionLogById(id);

      expect(result).toBeNull();
    });
  });
});
