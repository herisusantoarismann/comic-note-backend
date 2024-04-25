import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUser } from '../auth/dto/register-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import { IUser } from './interfaces/user.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: CACHE_MANAGER, useValue: {} },
        PrismaService,
        JwtService,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      const users: IUser[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
      ];
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce([users, users.length]);

      const result = await controller.findAll({}, 'query', 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(users);
      expect(result.totalPages).toBe(1);
      expect(result.currentPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return user details', async () => {
      const user: IUser = { id: 1, name: 'User 1', email: 'user1@example.com' };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user);

      const result = await controller.findOne('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password',
      };
      const user: IUser = { id: 2, ...createUserDto };
      jest.spyOn(service, 'create').mockResolvedValueOnce(user);

      const result = await controller.create(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUser = {
        name: 'Updated User',
        email: 'updateduser@example.com',
      };
      const user: IUser = { id: 1, ...updateUserDto };
      jest.spyOn(service, 'update').mockResolvedValueOnce(user);

      const result = await controller.update('1', updateUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should delete an existing user', async () => {
      const user: IUser = { id: 1, name: 'User 1', email: 'user1@example.com' };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(user);

      const result = await controller.remove('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
  });
});
