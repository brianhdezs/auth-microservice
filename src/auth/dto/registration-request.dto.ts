import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
// ⬇️ importa el decorador
import { NoProfanity } from '../../common/validators/no-profanity.validator';

export class RegistrationRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(100)
  @NoProfanity({ message: 'El email no puede contener lenguaje ofensivo.' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  @NoProfanity({ message: 'El nombre no puede contener malas palabras.' })
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  // (normalmente no hace falta filtrar groserías en teléfono)
  phoneNumber?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'ADMIN', description: 'Rol del usuario (ADMIN o USER)' })
  @IsOptional()
  @IsString()
  @NoProfanity({ message: 'El rol no puede contener lenguaje ofensivo.' })
  role?: string;
}
