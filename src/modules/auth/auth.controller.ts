import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './dto/register-user.dto';
import { LoginUser } from './dto/login-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';
import { VerifyEmail } from './dto/verify-email.dto';
import { VerifyToken } from './dto/verify-token.dto';
import { IUser } from '../user/interfaces/user.interface';
import { changePassword } from './dto/change-password.dto';
import { UserSchema } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Register user' })
  @Post('register')
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: UserSchema,
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email already exists' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @HttpCode(201)
  async register(@Body() createUser: RegisterUser) {
    const { name, email, password } = createUser;
    const user = await this.authService.register(name, email, password);
    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  async login(@Body() loginUser: LoginUser): Promise<{
    success: Boolean;
    data?: {
      id: number;
      name: string;
      email: string;
      access_token: string;
      refresh_token: string;
    };
    message?: string;
  }> {
    const { email, password } = loginUser;
    const user = await this.authService.login(email, password);
    if (user) {
      return {
        success: true,
        data: user,
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
  }

  @ApiOperation({ summary: 'Verify User by email' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            verify: { type: 'boolean' },
            emailSent: { type: 'boolean' },
          },
        },
      },
    },
  })
  @Post('verify/email')
  async verifyUserByEmail(@Body() verifyEmail: VerifyEmail): Promise<{
    success: Boolean;
    data: { verify: Boolean; emailSent: Boolean };
  }> {
    const { email } = verifyEmail;

    const user = await this.authService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sendToken = await this.authService.sendTokenToEmail(email);

    return {
      success: true,
      data: {
        verify: true,
        emailSent: sendToken.success,
      },
    };
  }

  @ApiOperation({ summary: 'Verify token' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        valid: { type: 'boolean' },
        data: UserSchema,
      },
    },
  })
  @Post('verify/token')
  async verifyToken(
    @Body() verifyToken: VerifyToken,
  ): Promise<{ success: Boolean; data: IUser; valid: Boolean }> {
    const { token } = verifyToken;

    const { valid, user } = await this.authService.verifyToken(token);

    if (!valid) {
      this.authService.removeToken(token);
    }

    return {
      success: true,
      valid,
      data: user,
    };
  }

  @ApiOperation({ summary: "Change user's password" })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: UserSchema,
      },
    },
  })
  @Post('change-password')
  async changePassword(
    @Body() changePassword: changePassword,
  ): Promise<{ success: Boolean; data: IUser }> {
    const { userId, oldPassword, newPassword } = changePassword;

    const user = await this.authService.changePassword(
      userId,
      oldPassword,
      newPassword,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  @ApiBearerAuth('Token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: UserSchema,
      },
    },
  })
  @Get('me')
  async findMe(@Req() request: any) {
    const user = request.user;

    const data = await this.userService.findOne(user?.id);

    return {
      success: true,
      data: data,
    };
  }
}
