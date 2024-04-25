import { Module } from '@nestjs/common';
import { FavoriteComicController } from './favorite.controller';
import { FavoriteComicService } from './favorite.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [FavoriteComicController],
  providers: [FavoriteComicService, PrismaService],
})
export class FavoriteModule {}
