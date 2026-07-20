import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        authVersion: true,
        status: true,
        avatar: true,
        passwordHash: true,
      },
    });
    if (!user) throw new UnauthorizedException('手机号或密码错误');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('手机号或密码错误');

    const payload = {
      sub: user.id,
      role: user.role,
      departmentId: user.departmentId,
      authVersion: user.authVersion,
    };
    const token = this.jwt.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        avatar: user.avatar,
      },
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        departmentId: true,
        avatar: true,
        email: true,
        department: { select: { id: true, name: true, type: true } },
        position: { select: { id: true, name: true } },
      },
    });
  }
}
