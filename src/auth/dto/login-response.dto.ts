import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @ApiProperty()
  user: UserDto; // Ya no necesita ser nullable

  @ApiProperty()
  token: string;
}