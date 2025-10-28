import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Patch,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { ResponseDto } from '../dto/response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Registrar usuario con rol y status (1=activo)
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario con rol y estado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario registrado exitosamente',
    type: ResponseDto,
  })
  async register(@Body() dto: RegistrationRequestDto): Promise<ResponseDto> {
    await this.authService.register(dto);
    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Usuario registrado exitosamente';
    return response;
  }

  // ✅ Iniciar sesión
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: LoginResponseDto,
  })
  async login(@Body() dto: LoginRequestDto): Promise<ResponseDto> {
    const loginResponse = await this.authService.login(dto);
    const response = new ResponseDto();
    response.isSuccess = true;
    response.result = loginResponse;
    return response;
  }

  // ✅ Cambiar estado (solo ADMIN)
  @Patch('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cambiar estado de un usuario (1=activo, 2=inactivo)' })
  async changeUserStatus(
    @Body() body: { email: string; status: number },
  ): Promise<ResponseDto> {
    if (![1, 2].includes(body.status)) {
      throw new HttpException(
        'El estado debe ser 1 (activo) o 2 (inactivo)',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.authService.toggleUserStatus(body.email, body.status);

    const response = new ResponseDto();
    response.isSuccess = true;
    response.message =
      body.status === 1
        ? 'Usuario activado correctamente'
        : 'Usuario desactivado correctamente';
    return response;
  }

  // ✅ Listar todos los usuarios (solo ADMIN)
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los usuarios con su estado' })
  async getAllUsers(): Promise<ResponseDto> {
    const users = await this.authService.getAllUsers();
    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = 'Usuarios obtenidos exitosamente';
    response.result = users;
    return response;
  }
}
