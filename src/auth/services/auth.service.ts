import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { JwtService } from './jwt.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) { }

  // ✅ Registro de usuario
  async register(registrationRequestDto: RegistrationRequestDto): Promise<void> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const existingUser = await this.userModel.findOne({
        email: registrationRequestDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictException('El usuario con este email ya existe');
      }

      // Crear nuevo usuario
      const user = new this.userModel({
        username: registrationRequestDto.email.toLowerCase(),
        email: registrationRequestDto.email.toLowerCase(),
        name: registrationRequestDto.name,
        phoneNumber: registrationRequestDto.phoneNumber,
        password: registrationRequestDto.password,
        roles: [],
      });

      // Guardar usuario (el password se hashea automáticamente en el pre-save)
      await user.save();
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      console.error('Error durante el registro:', error);
      throw new InternalServerErrorException('Error durante el registro del usuario');
    }
  }

  // ✅ Inicio de sesión
  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const username = loginRequestDto.userName.toLowerCase();

    // Buscar usuario por nombre de usuario o email
    const user = await this.userModel.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      throw new UnauthorizedException('El nombre de usuario o la contraseña es incorrecto');
    }

    // Validar contraseña
    const isValid = await bcrypt.compare(loginRequestDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('El nombre de usuario o la contraseña es incorrecto');
    }

    // Generar token JWT
    const token = this.jwtService.generateToken(user, user.roles);

    // Crear DTO del usuario
    const userDto: UserDto = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
    };

    return { user: userDto, token };
  }

  // ✅ Asignar roles
  async assignRole(email: string, roleName: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new NotFoundException(`No se encontró un usuario con el email ${email}`);
    }

    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
      await user.save();
    }
  }
}
