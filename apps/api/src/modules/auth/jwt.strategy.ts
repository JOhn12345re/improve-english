import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Upsert: create user with defaults on first login, otherwise just fetch
    const user = await this.prisma.user.upsert({
      where: { id: payload.sub },
      create: {
        id: payload.sub,
        email: payload.email,
        subscription: { create: { plan: 'free', status: 'active' } },
      },
      update: {},
      include: { subscription: true },
    });

    const isPremium =
      user.subscription?.status === 'active' &&
      user.subscription?.plan !== 'free';

    return { id: user.id, email: user.email, level: user.level, isPremium };
  }
}
