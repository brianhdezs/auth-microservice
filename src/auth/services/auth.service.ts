import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserV2 } from '../entities/user-v2.entity';
import { JwtService } from './jwt.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserV2.name) private readonly userModel: Model<UserV2>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegistrationRequestDto): Promise<void> {
    const existingUser = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existingUser) throw new ConflictException('El usuario ya existe');

    const user = new this.userModel({
      username: dto.email.toLowerCase(),
      email: dto.email.toLowerCase(),
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      roles: dto.role ? [dto.role.toUpperCase()] : ['USER'],
      status: 1,
    });

    await user.save();
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const username = dto.userName.toLowerCase();
    const user = await this.userModel.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) throw new UnauthorizedException('Usuario o contraseña inválidos');
    if (user.status === 2)
      throw new UnauthorizedException('Tu cuenta está deshabilitada');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales incorrectas');

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

  async toggleUserStatus(email: string, status: number): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.status = status;
    await user.save();
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userModel.find().select('-password');
    return users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      phoneNumber: u.phoneNumber,
      roles: u.roles,
      status: u.status,
    }));
  }
}
