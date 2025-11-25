import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
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

// ACTUALIZAR DATOS DE UN USUARIO (PATCH)
export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico no válido.' })
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @NoProfanity({ message: 'El nombre no puede contener lenguaje ofensivo.' })
  name?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'El número de teléfono debe tener exactamente 10 dígitos.',
  })
  phoneNumber?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;
}

