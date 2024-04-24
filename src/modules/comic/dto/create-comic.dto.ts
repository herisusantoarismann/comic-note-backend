import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';

export class CreateComic {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  genres: number[];

  @ApiProperty()
  @IsInt()
  chapter: number;

  @ApiProperty()
  @IsInt()
  updateDay: number;

  @ApiProperty({ required: false }) // Make it optional
  @IsOptional()
  @IsString()
  cover?: string;
}
