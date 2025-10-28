import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { JwtService } from './jwt.service';
import { UserV2 } from '../entities/user-v2.entity';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserV2.name) private readonly userModel: Model<UserV2>,
    private readonly jwtService: JwtService,
  ) {}

  // Registrar nuevo usuario con rol y status por defecto = 1 (activo)
  async register(dto: RegistrationRequestDto): Promise<void> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists)
      throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      username: dto.email,
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
      roles: [dto.role?.toUpperCase() || 'USER'],
      status: 1, // activo por defecto
    });

    await user.save();
  }

  // Iniciar sesión
  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({ email: dto.userName });

    if (!user)
      throw new UnauthorizedException('Credenciales inválidas');

    if (user.status === 2)
      throw new UnauthorizedException('Tu cuenta está deshabilitada');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid)
      throw new UnauthorizedException('El correo o la contraseña son incorrectos');

    const token = this.jwtService.generateToken(user, user.roles);

    const userDto: UserDto = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      status: user.status,
    };

    return { user: userDto, token };
  }

  // Obtener todos los usuarios (solo ADMIN)
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userModel.find().exec();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      status: user.status,
    }));
  }

  // Actualizar estado de usuario por username (correo)
  async updateUserStatus(username: string, status: number): Promise<void> {
    const user = await this.userModel.findOne({ username });
    if (!user)
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

    user.status = status;
    await user.save();
  }
}
