import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      passReqToCallback: true, 
    });
  }

  // validate se ejecuta en cada request protegida por JWT
  async validate(req: any, payload: any): Promise<UserV2> {
    const { sub } = payload;
    const user = await this.userModel.findById(sub).exec();

    if (!user) {
      throw new UnauthorizedException('Token no válido o usuario no encontrado');
    }

    const currentPath = req.route?.path || '';

    // Si el usuario está inactivo (2)
    if (user.status === 2) {
      // Permitir solo si es ADMIN y está accediendo a /auth/status
      const isAdmin = user.roles.includes('ADMIN');
      const isStatusEndpoint = currentPath.includes('/auth/status');

      if (!(isAdmin && isStatusEndpoint)) {
        throw new UnauthorizedException('Tu cuenta está deshabilitada');
      }
    }

    return user;
  }
}
