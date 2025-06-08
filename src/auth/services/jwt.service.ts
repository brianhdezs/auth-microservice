import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(user: User, roles: string[]): string {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      roles,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      issuer: this.configService.get<string>('JWT_ISSUER'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });
  }
}