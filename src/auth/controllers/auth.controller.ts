import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Put,
  Param,
  UseGuards,
  HttpException,
  Delete,
  Req,     
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { ResponseDto } from '../dto/response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Registrar nuevo usuario con rol y estado (por defecto activo)
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

  // Login (valida si está activo)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas o usuario inactivo',
  })
  async login(@Body() dto: LoginRequestDto): Promise<ResponseDto> {
    const loginResponse = await this.authService.login(dto);
    const response = new ResponseDto();
    response.isSuccess = true;
    response.result = loginResponse;
    return response;
  }

  // Actualizar estatus (1=activo, 2=inactivo) por correo (username)
  @Put('status/:username')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({
    summary:
      'Actualizar el estatus (1=activo, 2=inactivo) de un usuario por username (correo)',
  })
  @ApiParam({ name: 'username', type: String, example: 'pp@example.com' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 2,
          description: '1 = activo, 2 = inactivo',
        },
      },
      required: ['status'],
    },
  })
  async updateUserStatus(
    @Param('username') username: string,
    @Body() body: { status: number },
  ): Promise<ResponseDto> {
    if (!body || typeof body.status !== 'number') {
      const response = new ResponseDto();
      response.isSuccess = false;
      response.message = 'El campo "status" es requerido';
      return response;
    }

    await this.authService.updateStatus(username, body.status);

    const response = new ResponseDto();
    response.isSuccess = true;
    response.message = `Usuario ${body.status === 1 ? 'activado' : 'desactivado'
      } correctamente`;
    return response;
  }

  // Listar todos los usuarios (solo ADMIN)
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los usuarios con su estatus' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuarios obtenidos exitosamente',
    type: ResponseDto,
  })
  async getAllUsers(): Promise<ResponseDto> {
    try {
      const users = await this.authService.getAllUsers();
      const response = new ResponseDto();
      response.isSuccess = true;
      response.message = 'Usuarios obtenidos exitosamente';
      response.result = users;
      return response;
    } catch (error) {
      throw new HttpException(
        'Error al obtener los usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===========================================================
  // 🔹 Endpoint público para obtener un usuario por ID (uso interno)
  // ===========================================================
@Get('public/:id')
@ApiOperation({ summary: 'Obtener datos públicos de un usuario' })
@ApiParam({ name: 'id', type: String })
@ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
async getUserPublic(@Param('id') id: string): Promise<ResponseDto> {
  const user = await this.authService.getUserPublic(id);
  const response = new ResponseDto();
  response.isSuccess = true;
  response.result = user;
  return response;
}
// ==============================
  // 🗑️ Eliminar MI propia cuenta
  // ==============================
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar mi propia cuenta y mis productos' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada' })
  async deleteMyAccount(@Req() req: Request): Promise<ResponseDto> {
    const logged = req.user as any; // JWT payload
    if (!logged || !logged.sub) {
      throw new HttpException('No autenticado', HttpStatus.UNAUTHORIZED);
    }

    return await this.authService.deleteUserAndProducts(logged.sub);
  }
}