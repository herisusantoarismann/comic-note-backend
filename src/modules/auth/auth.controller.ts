import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './dto/register-user.dto';
import { LoginUser } from './dto/login-user.dto';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
}
