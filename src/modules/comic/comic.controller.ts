import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Comic } from './interfaces/comic.interface';
import { CreateComic } from './dto/create-comic.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { convertDay } from 'src/common/helpers/convertDay';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @ApiOperation({ summary: 'Get list comics user' })
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
  async findAll(
    @Req() request: any,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: Comic[];
    page: number;
    totalPages: number;
    currentPage: number;
  }> {
    const user = request.user;

    const [comics, totalCount] = await this.comicService.findAll(
      user?.id,
      +page,
      +pageSize,
      query,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: comics.map((comic: Comic) => {
        return {
          ...comic,
          day: convertDay(comic.updateDay),
        };
      }),
      page,
      totalPages,
      currentPage: +page,
    };
  }

  @ApiOperation({ summary: 'Get detail comic user' })
  @Get(':id')
  async findOne(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<{ success: Boolean; data: Comic }> {
    const user = request.user;

    const comic = await this.comicService.findOne(+user?.id, +id);

    if (!comic) {
      throw new NotFoundException('Comic Not Found');
    }

    return {
      success: true,
      data: {
        ...comic,
        day: convertDay(comic.updateDay),
      },
    };
  }

  @ApiOperation({ summary: 'Add comic' })
  @Post()
  async create(
    @Req() request: any,
    @Body() createComicDto: CreateComic,
  ): Promise<{ success: Boolean; data: Comic }> {
    const user = request.user;

    const newComic = await this.comicService.create(user?.id, createComicDto);

    return {
      success: true,
      data: {
        ...newComic,
        day: convertDay(newComic?.updateDay),
      },
    };
  }

  @ApiOperation({ summary: 'Update comic' })
  @Put(':id')
  async update(
    @Req() request: any,
    @Param('id') id: string,
    @Body() updateComic: CreateComic,
  ): Promise<{ success: Boolean; data: Comic }> {
    const user = request.user;

    const updatedComic = await this.comicService.update(
      +user.id,
      +id,
      updateComic,
    );

    if (!updateComic) {
      throw new NotFoundException('Comic not Found');
    }

    return {
      success: true,
      data: {
        ...updatedComic,
        day: convertDay(updatedComic.updateDay),
      },
    };
  }

  @ApiOperation({ summary: 'Delete comic' })
  @Delete(':id')
  async remove(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<{ success: Boolean; message: string }> {
    const user = request.user;

    const comic = await this.comicService.remove(+user?.id, +id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return {
      success: true,
      message: 'Comic successfully deleted.',
    };
  }
}
