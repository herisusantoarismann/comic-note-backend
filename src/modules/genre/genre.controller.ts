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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IGenre } from './interaces/genre.interface';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CreateGenre } from './dto/create-genre.dto';
import { UpdateGenre } from './dto/update-genre.dto';
import { GenreListSchema, GenreSchema } from './schemas/genre.schema';

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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: GenreListSchema,
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
        currentPage: { type: 'number', example: 1 },
      },
    },
  })
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
    page = Number.isInteger(+page) ? page : 1;
    pageSize = Number.isInteger(+pageSize) ? pageSize : 10;

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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: GenreSchema,
      },
    },
  })
  @Get(':id')
  @CacheKey('genre')
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
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: GenreSchema,
      },
    },
  })
  @Post()
  async create(
    @Body() createGenreDto: CreateGenre,
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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: GenreSchema,
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string', example: 'Genre successfully deleted.' },
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              label: { type: 'string' },
            },
          },
        },
      },
    },
  })
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
