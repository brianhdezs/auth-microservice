import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UserV2 } from '../entities/user-v2.entity';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  // ✅ Generar token compatible con UserV2
  generateToken(user: UserV2, roles: string[]): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles,
      status: user.status, // 👈 importante
    };

    return this.jwtService.sign(payload);
  }

  // ✅ Verificar token
  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
