// favorite-comic.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { FavoriteComicService } from './favorite.service';
import { CreateFavoriteComic } from './dto/create-favorite.dto';
import { IFavoriteComic } from './interfaces/favorite.interface';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@ApiTags('Favorites')
@UseInterceptors(CacheInterceptor)
@Controller('favorites')
export class FavoriteComicController {
  constructor(private readonly favoriteComicService: FavoriteComicService) {}

  @ApiOperation({ summary: 'Get list favorite comics user' })
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
  @CacheKey('favoriteComics')
  async findAll(
    @Req() request: any,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: IFavoriteComic[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    const user = request.user;

    const [favoriteComics, totalCount] =
      await this.favoriteComicService.findAll(
        user?.id,
        +page,
        +pageSize,
        query,
      );

    const totalPages = Math.ceil(totalCount / pageSize) ?? 1;

    return {
      success: true,
      data: favoriteComics,
      page: page ?? 1,
      totalPages: Number(totalPages) ? totalPages : 1,
      currentPage: Number(page) ? +page : 1,
    };
  }

  @ApiOperation({ summary: 'Add favorite comic' })
  @Post()
  async create(
    @Req() request: any,
    @Body() createFavoriteComicDto: CreateFavoriteComic,
  ): Promise<{ success: Boolean; data: IFavoriteComic }> {
    const { comicId } = createFavoriteComicDto;
    const user = request.user;

    const comic = await this.favoriteComicService.create(+user?.id, comicId);
    return {
      success: true,
      data: comic,
    };
  }

  @ApiOperation({ summary: 'Delete favorite comic' })
  @Delete(':id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ success: Boolean; message: string }> {
    await this.favoriteComicService.remove(+id);

    return {
      success: true,
      message: 'Favorite comic successfully delete',
    };
  }
}
