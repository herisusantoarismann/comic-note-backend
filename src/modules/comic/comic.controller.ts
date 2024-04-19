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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Get detail comic user' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Comic> {
    return this.comicService.findOne(+id);
  }

  @ApiOperation({ summary: 'Add comic' })
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

  @ApiOperation({ summary: 'Update comic' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createComicDto: CreateComic,
  ): Promise<Comic> {
    return this.comicService.update(+id, createComicDto);
  }

  @ApiOperation({ summary: 'Delete comic' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Comic> {
    return this.comicService.remove(+id);
  }
}
