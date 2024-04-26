import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyToken {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
