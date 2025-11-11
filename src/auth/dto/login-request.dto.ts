import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { NoProfanity } from '../../common/validators/no-profanity.validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @NoProfanity({ message: 'El email no puede contener lenguaje ofensivo.' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
