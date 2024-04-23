import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUser } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { CreateUser } from './dto/register-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    // Rollback data added during tests
    await prismaService.getPrisma().user.deleteMany({
      where: {
        OR: [
          {
            email: 'testing1@example.com',
          },
          {
            email: 'testing2@example.com',
          },
        ],
      },
    });
  });

  // Register Test
  describe('register', () => {
    const validUsers: CreateUser[] = [
      {
        name: 'Testing 1',
        email: 'testing1@example.com',
        password: 'password',
      },
      {
        name: 'Testing 2',
        email: 'testing2@example.com',
        password: 'password',
      },
    ];

    const invalidEmails: CreateUser[] = [
      { name: 'Invalid User', email: 'invalidemail.com', password: 'password' },
    ];

    it.each(validUsers)(
      'should register user with valid data: %p',
      async (createUserDto: CreateUser) => {
        const registeredUser = await authService.register(
          createUserDto.name,
          createUserDto.email,
          createUserDto.password,
        );
        expect(registeredUser.name).toBe(createUserDto.name);
        expect(registeredUser.email).toBe(createUserDto.email);
        expect(registeredUser.id).toBeDefined();
      },
    );

    it.each(validUsers)(
      'should throw error when registering user with existing email: %p',
      async (createUserDto: CreateUser) => {
        // Register user first
        await authService.register(
          createUserDto.name,
          createUserDto.email,
          createUserDto.password,
        );

        // Attempt to register with same email
        await expect(
          authService.register(
            createUserDto.name,
            createUserDto.email,
            createUserDto.password,
          ),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it.each(invalidEmails)(
      'should throw error when registering user with invalid email: %p',
      async (createUserDto: CreateUser) => {
        await expect(
          authService.register(
            createUserDto.name,
            createUserDto.email,
            createUserDto.password,
          ),
        ).rejects.toEqual(new BadRequestException('Email already exists'));
      },
    );
  });

  // Login Test
  describe('login', () => {
    it('should return user data with access token and refresh token on successful login', async () => {
      const loginUserDto: LoginUser = {
        email: 'johndoe@example.com',
        password: '123456',
      };

      const userData = {
        id: 1,
        name: 'Admin',
        email: 'johndoe@example.com',
      };

      jest.spyOn(authService, 'login').mockResolvedValueOnce({
        ...userData,
        access_token: 'mockedAccessToken',
        refresh_token: 'mockedRefreshToken',
      });
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('mockedAccessToken');
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('mockedRefreshToken');

      const result = await controller.login(loginUserDto);

      expect(result).toEqual({
        success: true,
        data: {
          ...userData,
          access_token: 'mockedAccessToken',
          refresh_token: 'mockedRefreshToken',
        },
      });
    });

    it('should return error message with invalid credentials', async () => {
      const loginUserDto: LoginUser = {
        email: 'johndoe@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(null);

      const result = await controller.login(loginUserDto);

      expect(result).toEqual({
        success: false,
        message: 'Invalid email or password',
      });
    });
  });
});
