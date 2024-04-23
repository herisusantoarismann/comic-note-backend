import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma.service';
import { CreateUser } from './dto/create-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      const users = [{ id: 1, name: 'User 1', email: 'user1@example.com' }];
      jest
        .spyOn(prismaService.getPrisma().user, 'findMany')
        .mockResolvedValueOnce(users as any);
      jest
        .spyOn(prismaService.getPrisma().user, 'count')
        .mockResolvedValueOnce(1);

      const result = await service.findAll(1, 10, 'query');

      expect(result[0]).toEqual(users);
      expect(result[1]).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return user details', async () => {
      const user = { id: 1, name: 'User 1', email: 'user1@example.com' };
      jest
        .spyOn(prismaService.getPrisma().user, 'findUnique')
        .mockResolvedValueOnce(user as any);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(prismaService.getPrisma().user, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(service.findOne(99)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password',
      };
      const user = { id: 2, ...createUserDto };
      jest
        .spyOn(prismaService.getPrisma().user, 'create')
        .mockResolvedValueOnce(user as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUser = {
        name: 'Updated User',
        email: 'updateduser@example.com',
      };
      const user = { id: 1, ...updateUserDto };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user as any);
      jest
        .spyOn(prismaService.getPrisma().user, 'update')
        .mockResolvedValueOnce(user as any);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(service.update(1, {} as UpdateUser)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an existing user', async () => {
      const user = { id: 1, name: 'User 1', email: 'user1@example.com' };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user as any);
      jest
        .spyOn(prismaService.getPrisma().user, 'delete')
        .mockResolvedValueOnce(user as any);

      const result = await service.remove(1);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(service.remove(1)).rejects.toThrowError(NotFoundException);
    });
  });
});
