import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserV2 } from '../entities/user-v2.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(UserV2.name) private readonly userModel: Model<UserV2>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
      issuer: configService.get<string>('JWT_ISSUER'),
      audience: configService.get<string>('JWT_AUDIENCE'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserV2> {
    const { sub } = payload;

    const user = await this.userModel.findById(sub).exec();
    if (!user) {
      throw new UnauthorizedException('Token no válido o usuario no encontrado');
    }

    // Si el usuario está inactivo (status 2), no se le permite autenticarse
    if (user.status === 2) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    return user;
  }
}
