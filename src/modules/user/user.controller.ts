// user.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUser } from '../auth/dto/register-user.dto';
import { UpdateUser } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
} from '@nestjs/cache-manager';
import { IUser } from '../auth/interfaces/user.interface';
import { Cache } from 'cache-manager';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@ApiTags('Users')
@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiOperation({ summary: 'Get list users' })
  @Get()
  @ApiQuery({
    name: 'query',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @CacheKey('users')
  async findAll(
    @Req() request: any,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: IUser[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    const [users, totalCount] = await this.userService.findAll(
      +page,
      +pageSize,
      query,
    );

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      success: true,
      data: users,
      page,
      totalPages,
      currentPage: +page || 1,
    };
  }

  @ApiOperation({ summary: 'Get detail user' })
  @CacheKey('comic')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ success: Boolean; data: IUser }> {
    const user = await this.userService.findOne(+id);

    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: 'Create user' })
  @Post()
  async create(
    @Body() createUserDto: CreateUser,
  ): Promise<{ success: Boolean; data: IUser }> {
    const user = await this.userService.create(createUserDto);

    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: 'Update user' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUser,
  ): Promise<{ success: Boolean; data: IUser }> {
    const user = await this.userService.update(+id, updateUserDto);

    return {
      success: true,
      data: user,
    };
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: Boolean; data: IUser }> {
    const user = await this.userService.remove(+id);

    return {
      success: true,
      data: user,
    };
  }
}
