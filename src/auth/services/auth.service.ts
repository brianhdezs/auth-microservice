import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from './jwt.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registrationRequestDto: RegistrationRequestDto): Promise<void> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUser = await this.userRepository.findOne({ 
        where: { email: registrationRequestDto.email } 
      });
      
      if (existingUser) {
        throw new ConflictException('El usuario con este email ya existe');
      }

      // Crear nuevo usuario
      const user = new User();
      user.username = registrationRequestDto.email;
      user.email = registrationRequestDto.email;
      user.name = registrationRequestDto.name;
      user.phoneNumber = registrationRequestDto.phoneNumber;
      user.password = registrationRequestDto.password;
      user.roles = [];

      // Guardar usuario
      await this.userRepository.save(user);
    } catch (error) {
      // Si es una excepción conocida, la re-lanzamos
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Para cualquier otro error, lanzamos una excepción interna
      console.error('Error durante el registro:', error);
      throw new InternalServerErrorException('Error durante el registro del usuario');
    }
  }

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    // Buscar usuario por nombre de usuario
    const user = await this.userRepository.findOne({
      where: { username: loginRequestDto.userName.toLowerCase() }
    });

    // Si no se encuentra el usuario
    if (!user) {
      throw new UnauthorizedException('El nombre de usuario o la contraseña es incorrecto');
    }

    // Validar contraseña
    const isValid = await user.validatePassword(loginRequestDto.password);
    if (!isValid) {
      throw new UnauthorizedException('El nombre de usuario o la contraseña es incorrecto');
    }

    // Generar token
    const token = this.jwtService.generateToken(user, user.roles);

    // Crear DTO con información del usuario
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
    };

    return {
      user: userDto,
      token,
    };
  }

  async assignRole(email: string, roleName: string): Promise<void> {
    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    // Si no se encuentra el usuario
    if (!user) {
      throw new NotFoundException(`No se encontró un usuario con el email ${email}`);
    }

    // Verificar si el rol ya está asignado
    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
      await this.userRepository.save(user);
    }
  }
}