import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  role: string;
  departmentId?: string;
  departmentType?: string;
  authVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        role: true,
        departmentId: true,
        authVersion: true,
        status: true,
        avatar: true,
        department: { select: { type: true } },
      },
    });
    if (!user) throw new UnauthorizedException();
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');
    if (user.authVersion !== payload.authVersion)
      throw new UnauthorizedException('登录已失效，请重新登录');
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      departmentType: user.department?.type ?? null,
      authVersion: user.authVersion,
      status: user.status,
      avatar: user.avatar,
    };
  }
}
