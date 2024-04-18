import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateComic {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  genre: string;

  @ApiProperty()
  @IsInt()
  chapter: number;

  @ApiProperty()
  @IsInt()
  updateDay: number;

  @ApiProperty()
  @IsNotEmpty()
  idPengguna: number;
}
