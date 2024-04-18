import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Comic } from './interfaces/comic.interface';
import { CreateComic } from './dto/create-comic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @Get()
  async findAll(): Promise<{ success: Boolean; data: Comic[] }> {
    const comics = await this.comicService.findAll();

    return {
      success: true,
      data: comics,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Comic> {
    return this.comicService.findOne(+id);
  }

  @Post()
  async create(@Body() createComicDto: CreateComic): Promise<Comic> {
    return this.comicService.create(createComicDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createComicDto: CreateComic,
  ): Promise<Comic> {
    return this.comicService.update(+id, createComicDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Comic> {
    return this.comicService.remove(+id);
  }
}
