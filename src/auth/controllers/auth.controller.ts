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
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario registrado exitosamente', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de registro inválidos' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El usuario ya existe' })
  async register(@Body() registrationRequestDto: RegistrationRequestDto): Promise<ResponseDto> {
    // El servicio ahora lanza excepciones en lugar de devolver mensajes de error
    await this.authService.register(registrationRequestDto);
    
    // Si llegamos aquí, el registro fue exitoso
    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Usuario registrado exitosamente';
    return response;
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Inicio de sesión exitoso', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciales inválidas' })
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<ResponseDto> {
    // El servicio lanzará una excepción UnauthorizedException si el login falla
    const loginResponse = await this.authService.login(loginRequestDto);
    
    // Si llegamos aquí, el login fue exitoso
    const response = new ResponseDto();
    response.isSuccess = true;
    response.result = loginResponse;
    return response;
  }

  @Post('assignRole')
  @ApiOperation({ summary: 'Asignar rol a un usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rol asignado exitosamente', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  async assignRole(@Body() registrationRequestDto: RegistrationRequestDto): Promise<ResponseDto> {
    // Verificar que el rol existe antes de intentar usarlo
    if (!registrationRequestDto.role) {
      const response = new ResponseDto();
      response.isSuccess = false;
      response.message = 'El rol es requerido';
      return response;
    }
    
    // El servicio lanzará excepciones para los casos de error
    await this.authService.assignRole(
      registrationRequestDto.email,
      registrationRequestDto.role.toUpperCase(),
    );
    
    // Si llegamos aquí, la asignación de rol fue exitosa
    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Rol asignado exitosamente';
    return response;
  }
}