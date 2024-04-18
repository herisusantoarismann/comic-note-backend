import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { ApiBadRequestResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('auth')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered.',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const user = await this.usersService.register(name, email, password);
    return {
      success: true,
      data: {
        name: user.name,
        email: user.email,
      },
    };
  }

  @Post('login')
  async login(@Body() LoginDto: { email: string; password: string }) {
    const { email, password } = LoginDto;
    const user = await this.usersService.login(email, password);
    if (user) {
      return { user };
    } else {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
  }
}
