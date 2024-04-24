import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateGenre {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
