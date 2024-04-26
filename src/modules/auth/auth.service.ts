import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../user/interfaces/user.interface';
import { MailService } from '../mail/mail.service';
import { generateRandomNumbers } from 'src/common/helpers/generateRandomNumbers';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<IUser> {
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
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
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
    id: number;
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
      id: user?.id,
      name: user?.name,
      email: user?.email,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(id: number, email: string): string {
    const payload = { id: id, email: email }; // Customize payload as needed
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(id: number): string {
    const payload = { id: id }; // Customize payload as needed
    return this.jwtService.sign(payload);
  }

  comparePassword(enteredPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, hash);
  }

  async validateUser(email: string, password: string): Promise<IUser | null> {
    const user = await this.findByEmail(email);

    if (user && (await this.comparePassword(password, user.password))) {
      const { password, ...result } = user; // Omit password from returned user object
      return result;
    }

    return null;
  }

  async createToken(user: IUser, token: string) {
    const expirationDuration = { minutes: 1 };

    const expiredAt = add(new Date(), expirationDuration);

    return this.prisma.getPrisma().resetPassword.create({
      data: {
        token: token,
        expiredAt: expiredAt,
        user: { connect: { id: user.id } },
      },
    });
  }

  async sendTokenToEmail(email: string) {
    const token = generateRandomNumbers(6);

    const user = await this.findByEmail(email);

    const resetPassword = await this.createToken(user, token);

    if (!resetPassword) {
      throw new InternalServerErrorException('Token failed to created');
    }

    const options = {
      to: email,
      subject: 'Token Reset Password',
      content: 'token',
      token: token,
    };

    return this.mailService.sendMail(options);
  }

  async verifyToken(token: string) {
    const resetPassword = await this.prisma
      .getPrisma()
      .resetPassword.findFirst({
        where: {
          AND: [{ token }],
        },
        select: {
          id: true,
          expiredAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePic: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });

    if (!resetPassword) {
      throw new NotFoundException('Token not found');
    }

    const now = new Date();
    const valid = now < resetPassword.expiredAt;
    return {
      valid,
      user: resetPassword.user,
    };
  }

  async removeToken(token: string) {
    return this.prisma.getPrisma().resetPassword.delete({
      where: { token },
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.getPrisma().user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = await this.comparePassword(
      oldPassword,
      user.password,
    );

    if (!validPassword) {
      throw new BadRequestException('Password is invalid');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.getPrisma().user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });
  }
}
