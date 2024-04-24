import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGenre {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
