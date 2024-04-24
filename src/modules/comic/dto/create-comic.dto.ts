import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  ArrayMinSize,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateComic {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber({}, { each: true })
  genres: number[];

  @ApiProperty()
  @IsInt()
  chapter: number;

  @ApiProperty()
  @IsInt()
  updateDay: number;

  @ApiProperty({ required: false }) // Make it optional
  @IsOptional()
  @IsInt()
  cover?: number;
}
