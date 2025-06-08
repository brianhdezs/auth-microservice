import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// Definir explícitamente la interfaz para el payload JWT
export interface JwtPayload {
  email: string;
  sub: string;
  name: string;
  roles: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    // Pasar un objeto de configuración único al constructor de Strategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER'),
      audience: configService.get<string>('JWT_AUDIENCE'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;
    
    // Buscar usuario por email
    const user = await this.userRepository.findOne({ where: { email } });

    // Si no se encuentra el usuario, lanzar excepción
    if (!user) {
      throw new UnauthorizedException('Token no válido');
    }

    return user;
  }
}