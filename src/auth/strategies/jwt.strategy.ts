import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    const { sub } = payload;
    const user = await this.userModel.findById(sub).exec();

    if (!user) throw new UnauthorizedException('Token inválido o usuario no encontrado');
    if (user.status === 2) throw new UnauthorizedException('Tu cuenta está deshabilitada');

    return user;
  }
}
