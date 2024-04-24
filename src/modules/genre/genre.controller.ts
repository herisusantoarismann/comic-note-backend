// genre.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IGenre } from './interaces/genre.interface';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CreateGenre } from './dto/create-genre.dto';
import { UpdateGenre } from './dto/update-genre.dto';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags('Genres')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @ApiOperation({ summary: 'Get list genres' })
  @Get()
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @CacheKey('genres')
  async findAll(
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: IGenre[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    const [genres, totalCount] = await this.genreService.findAll(
      page,
      pageSize,
      query,
    );

    const totalPages = Math.ceil(totalCount / pageSize) ?? 1;

    return {
      success: true,
      data: genres,
      page: page ?? 1,
      totalPages: Number(totalPages) ? totalPages : 1,
      currentPage: Number(page) ? +page : 1,
    };
  }

  @ApiOperation({ summary: 'Get spesific genre' })
  @Get(':id')
  @CacheKey('comic')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ success: Boolean; data: IGenre }> {
    const genre = await this.genreService.findOne(+id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }
    return {
      success: true,
      data: genre,
    };
  }

  @ApiOperation({ summary: 'Create new genre' })
  @Post()
  async create(
    @Body('name') createGenreDto: CreateGenre,
  ): Promise<{ success: true; data: IGenre }> {
    const genre = await this.genreService.create(createGenreDto);

    if (!genre) {
      throw new BadRequestException('Create genre failed');
    }

    return {
      success: true,
      data: genre,
    };
  }

  @ApiOperation({ summary: 'Update genre' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('name') updateGenreDto: UpdateGenre,
  ): Promise<{ success: Boolean; data: IGenre }> {
    const genre = await this.genreService.update(+id, updateGenreDto);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return {
      success: true,
      data: genre,
    };
  }

  @ApiOperation({ summary: 'Delete genre' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: true; message: string }> {
    const genre = await this.genreService.remove(+id);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return {
      success: true,
      message: 'Genre successfully deleted.',
    };
  }

  @ApiOperation({ summary: 'Data genre for select' })
  @Get('select-data')
  async selectData(): Promise<{
    success: Boolean;
    data: { value: number; label: string }[];
  }> {
    const genres = await this.genreService.selectData();

    return {
      success: true,
      data: genres.map((genre: IGenre) => {
        return {
          value: genre.id,
          label: genre.name,
        };
      }),
    };
  }
}
