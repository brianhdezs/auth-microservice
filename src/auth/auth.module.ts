import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Importar módulo de TypeORM para el User
    TypeOrmModule.forFeature([User]),
    
    // Configurar módulo de Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Configurar módulo JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
          issuer: configService.get('JWT_ISSUER'),
          audience: configService.get('JWT_AUDIENCE'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy],
  exports: [AuthService, JwtService, JwtStrategy, PassportModule],
})
export class AuthModule {}