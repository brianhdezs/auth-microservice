import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { ResponseDto } from '../dto/response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario registrado exitosamente',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de registro inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El usuario ya existe',
  })
  async register(
    @Body() registrationRequestDto: RegistrationRequestDto,
  ): Promise<ResponseDto> {
    await this.authService.register(registrationRequestDto);

    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Usuario registrado exitosamente';
    return response;
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<ResponseDto> {
    const loginResponse = await this.authService.login(loginRequestDto);

    const response = new ResponseDto();
    response.isSuccess = true;
    response.result = loginResponse;
    return response;
  }

  @Post('assignRole')
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rol asignado exitosamente',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  async assignRole(
    @Body() registrationRequestDto: RegistrationRequestDto,
  ): Promise<ResponseDto> {
    if (!registrationRequestDto.role) {
      const response = new ResponseDto();
      response.isSuccess = false;
      response.message = 'El rol es requerido';
      return response;
    }

    await this.authService.assignRole(
      registrationRequestDto.email,
      registrationRequestDto.role.toUpperCase(),
    );

    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Rol asignado exitosamente';
    return response;
  }
}
