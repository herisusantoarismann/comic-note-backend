import { Module } from '@nestjs/common';
import { ComicService } from './comic.service';
import { ComicController } from './comic.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ComicController],
  providers: [ComicService, PrismaService],
})
export class ComicModule {}
