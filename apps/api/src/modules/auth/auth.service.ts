import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    // Note: le mot de passe est gere par Supabase Auth
    // Cette methode est conservee pour compatibilite custom auth
    return user;
  }

  signToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
