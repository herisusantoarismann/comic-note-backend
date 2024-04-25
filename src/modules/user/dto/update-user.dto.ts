import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateUser {
  @ApiProperty({
    nullable: false,
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    nullable: true,
    type: Number,
  })
  @IsInt()
  profilePicId?: number;
}
