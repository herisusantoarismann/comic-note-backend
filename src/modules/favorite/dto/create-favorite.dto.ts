import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateFavoriteComic {
  @ApiProperty()
  @IsInt()
  comicId: number;
}
