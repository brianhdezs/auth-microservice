import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from './jwt.service';
import { User } from '../entities/user.entity';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegistrationRequestDto } from '../dto/registration-request.dto';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegistrationRequestDto): Promise<void> {
    const { email, password, name, phoneNumber, role } = dto;

    const exists = await this.userModel.findOne({ email });
    if (exists) throw new BadRequestException('El usuario ya existe');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username: email,
      email,
      name,
      phoneNumber,
      password: hashedPassword,
      roles: [role || 'USER'],
      status: 1,
    });

    await newUser.save();
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({
      $or: [{ username: dto.userName }, { email: dto.userName }],
    });

    if (!user)
      throw new UnauthorizedException('El correo o la contraseña son incorrectos');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid)
      throw new UnauthorizedException('El correo o la contraseña son incorrectos');

    if (user.status === 2 && !user.roles.includes('ADMIN'))
      throw new UnauthorizedException('Tu cuenta está deshabilitada');

    const token = this.jwtService.generateToken(user, user.roles);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
        status: user.status,
      },
      token,
    };
  }

  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userModel.find().lean();
    return users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      phoneNumber: u.phoneNumber,
      roles: u.roles,
      status: u.status,
    }));
  }

  async updateStatus(username: string, status: number): Promise<void> {
    const user = await this.userModel.findOne({ username });

    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (![1, 2].includes(status))
      throw new BadRequestException('El estado debe ser 1 (activo) o 2 (inactivo)');

    user.status = status;
    await user.save();
  }
}
