import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.getPrisma().user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.getPrisma().user.findUnique({
      where: {
        email,
      },
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    name: string;
    email: string;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.generateAccessToken(user?.id, user?.email);
    const refreshToken = this.generateRefreshToken(user?.id);
    return {
      name: user?.name,
      email: user?.email,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(id: number, email: string): string {
    const payload = { sub: id, username: email }; // Customize payload as needed
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(id: number): string {
    const payload = { sub: id }; // Customize payload as needed
    return this.jwtService.sign(payload);
  }

  async comparePassword(
    enteredPassword: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, hash);
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (user && (await this.comparePassword(password, user.password))) {
      const { password, ...result } = user; // Omit password from returned user object
      return result;
    }

    return null;
  }
}
