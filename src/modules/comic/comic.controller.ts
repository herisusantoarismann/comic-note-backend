import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { IComic } from './interfaces/comic.interface';
import { CreateComic } from './dto/create-comic.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { convertDay } from '../../common/helpers/convertDay';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  Cache,
  CacheKey,
} from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ICoverComic } from './interfaces/cover.interface';

@ApiBearerAuth('Token')
@UseGuards(AuthGuard)
@ApiTags('Comics')
@UseInterceptors(CacheInterceptor)
@Controller('comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
  @CacheKey('comics')
  async findAll(
    @Req() request: any,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{
    success: Boolean;
    data: IComic[];
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

    const totalPages = Math.ceil(totalCount / pageSize) ?? 1;

    return {
      success: true,
      data: comics.map((comic: IComic) => {
        return {
          ...comic,
          day: convertDay(comic.updateDay),
        };
      }),
      page: page ?? 1,
      totalPages: Number(totalPages) ? totalPages : 1,
      currentPage: Number(page) ? +page : 1,
    };
  }

  @ApiOperation({ summary: 'Get detail comic user' })
  @CacheKey('comic')
  @Get(':id')
  async findOne(
    @Req() request: any,
    @Param('id') id: string,
  ): Promise<{ success: Boolean; data: IComic }> {
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
  ): Promise<{ success: Boolean; data: IComic }> {
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
  ): Promise<{ success: Boolean; data: IComic }> {
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

  @ApiOperation({ summary: 'Upload cover comic' })
  @Post('cover')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cover'],
      properties: {
        cover: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/cover-comic',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const fileName = `${uuidv4()}.${ext}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Only JPG, JPEG, and PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Req() request: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    cover: Express.Multer.File,
  ): Promise<{ success: Boolean; data: ICoverComic }> {
    const user = request.user;

    const savedFile = await this.comicService.uploadFile(+user?.id, cover);

    return {
      success: true,
      data: savedFile,
    };
  }
}
