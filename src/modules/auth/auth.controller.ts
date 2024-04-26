import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './dto/register-user.dto';
import { LoginUser } from './dto/login-user.dto';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';
import { VerifyEmail } from './dto/verify-email.dto';
import { VerifyToken } from './dto/verify-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register user' })
  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered.',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
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
    description: 'The user has been successfully login.',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(200)
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
  @Post('verify/token')
  async verifyToken(
    @Body() verifyToken: VerifyToken,
  ): Promise<{ success: Boolean; data: { valid: Boolean } }> {
    const { token } = verifyToken;

    const valid = await this.authService.verifyToken(token);

    if (!valid) {
      this.authService.removeToken(token);
    }

    return {
      success: true,
      data: {
        valid,
      },
    };
  }
}
