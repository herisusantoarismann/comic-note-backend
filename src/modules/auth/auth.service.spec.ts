import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { serialize } from 'v8';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'testing@example.com',
      };
      const createUserDto = {
        name: 'John Doe',
        email: 'testing@example.com',
        password: 'password',
      };

      jest
        .spyOn(prismaService.getPrisma().user, 'create')
        .mockResolvedValue(userData as any);

      const result = await service.register(
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
      );

      expect(result).toEqual(userData);
    });

    it('should throw BadRequestException when registering with existing email', async () => {
      const existingUser = {
        id: 1,
        name: 'John Doe',
        email: 'johndoe@example.com',
      };
      const createUserDto = {
        name: 'Jane Doe',
        email: 'johndoe@example.com',
        password: 'password',
      };

      jest
        .spyOn(prismaService.getPrisma().user, 'findUnique')
        .mockResolvedValue(existingUser as any);

      await expect(
        service.register(
          createUserDto.name,
          createUserDto.email,
          createUserDto.password,
        ),
      ).rejects.toEqual(new BadRequestException('Email already exists'));
    });
  });

  describe('login', () => {
    it('should return user data with access token and refresh token on successful login', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'testing@example.com',
        password:
          '$2b$10$FPHfZnG3zecb/7MPqG1pB.ztXQ3gjG2fVX3a0IldZTDXDd0pdnsJK',
      };
      const loginUserDto = {
        email: 'testing@example.com',
        password: 'password',
      };
      const accessToken = 'mockedAccessToken';
      const refreshToken = 'mockedRefreshToken';

      jest.spyOn(service, 'validateUser').mockResolvedValue(user);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.login(
        loginUserDto.email,
        loginUserDto.password,
      );

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginUserDto = {
        email: 'testing@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login(loginUserDto.email, loginUserDto.password),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const enteredPassword = 'password';
      const hashedPassword = await bcrypt.hash(enteredPassword, 10);

      const result = await service.comparePassword(
        enteredPassword,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const enteredPassword = 'password';
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);

      const result = await service.comparePassword(
        enteredPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });
  });
});
