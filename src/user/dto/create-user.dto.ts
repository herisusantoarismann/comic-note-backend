import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    nullable: false,
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    nullable: false,
    example: 'johndoe@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    minimum: 6,
    nullable: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
