import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Comic } from './interfaces/comic.interface';
import { CreateComic } from './dto/create-comic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { convertDay } from 'src/common/helpers/convertDay';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @Get()
  async findAll(
    @Req() request: any,
  ): Promise<{ success: Boolean; data: Comic[] }> {
    const user = request.user;

    const comics = await this.comicService.findAll(user?.id);

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
  async create(
    @Req() request: any,
    @Body() createComicDto: CreateComic,
  ): Promise<{ success: Boolean; data: Comic }> {
    const user = request.user;

    console.info(user?.id);

    const newComic = await this.comicService.create(user?.id, createComicDto);

    return {
      success: true,
      data: {
        ...newComic,
        day: convertDay(newComic?.updateDay),
      },
    };
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
