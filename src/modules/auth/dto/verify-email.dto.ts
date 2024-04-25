import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmail {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
