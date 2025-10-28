import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegistrationRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'ADMIN', description: 'Rol del usuario (ADMIN o USER)' })
  @IsOptional()
  role?: string;
}
