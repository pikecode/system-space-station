import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { canDepartmentLoginMiniApp } from 'shared';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, MiniAppLoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const account = dto.account?.trim() || dto.phone;
    if (!account) throw new UnauthorizedException('账号或密码错误');
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: account },
          { username: account.toLowerCase() },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        role: true,
        departmentId: true,
        authVersion: true,
        status: true,
        avatar: true,
        shareCode: true,
        passwordHash: true,
      },
    });
    if (!user) throw new UnauthorizedException('账号或密码错误');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');
    if (!user.passwordHash) throw new UnauthorizedException('该账号不支持系统登录');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('账号或密码错误');

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

  async miniAppLogin(dto: MiniAppLoginDto) {
    const employeeNo = dto.employeeNo.trim().toUpperCase();
    if (!employeeNo) throw new UnauthorizedException('编号或密码错误');

    const user = await this.prisma.user.findUnique({
      where: { employeeNo },
      select: {
        id: true,
        name: true,
        employeeNo: true,
        role: true,
        departmentId: true,
        authVersion: true,
        status: true,
        avatar: true,
        shareCode: true,
        passwordHash: true,
        department: { select: { id: true, name: true, type: true, status: true, parentId: true } },
      },
    });
    if (!user) throw new UnauthorizedException('编号或密码错误');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');
    if (!user.passwordHash) throw new UnauthorizedException('该账号不支持小程序登录');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('编号或密码错误');
    await this.ensureMiniAppDepartmentAccess(user.department);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildLoginResponse(user);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        employeeNo: true,
        role: true,
        departmentId: true,
        avatar: true,
        email: true,
        shareCode: true,
        department: { select: { id: true, name: true, type: true } },
        position: { select: { id: true, name: true } },
      },
    });
  }

  private signToken(user: { id: string; role: string; departmentId: string | null; departmentType?: string | null; authVersion: number }) {
    return this.jwt.sign({
      sub: user.id,
      role: user.role,
      departmentId: user.departmentId,
      departmentType: user.departmentType ?? null,
      authVersion: user.authVersion,
    });
  }

  private buildLoginResponse(user: {
    id: string;
    name: string;
    employeeNo?: string | null;
    role: string;
    departmentId: string | null;
    avatar: string | null;
    authVersion: number;
    shareCode?: string | null;
    department?: { id: string; name: string; type: string } | null;
  }) {
    return {
      token: this.signToken({ ...user, departmentType: user.department?.type ?? null }),
      user: {
        id: user.id,
        name: user.name,
        employeeNo: user.employeeNo ?? null,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department ?? null,
        avatar: user.avatar,
        shareCode: user.shareCode ?? null,
      },
    };
  }

  private async fetchWechatOpenId(code: string): Promise<string> {
    const appid = this.config.getOrThrow<string>('WECHAT_APPID');
    const secret = this.config.getOrThrow<string>('WECHAT_SECRET');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = await res.json() as { openid?: string; errcode?: number; errmsg?: string };
    if (!data.openid) throw new UnauthorizedException(`微信登录失败: ${data.errmsg ?? 'unknown'}`);
    return data.openid;
  }

  async wechatLogin(code: string) {
    const openid = await this.fetchWechatOpenId(code);
    const user = await this.prisma.user.findUnique({
      where: { wechatOpenId: openid },
      select: {
        id: true,
        name: true,
        employeeNo: true,
        role: true,
        departmentId: true,
        avatar: true,
        authVersion: true,
        status: true,
        shareCode: true,
        department: { select: { id: true, name: true, type: true, status: true, parentId: true } },
      },
    });
    if (!user) throw new NotFoundException('微信未绑定账号，请先绑定');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');
    await this.ensureMiniAppDepartmentAccess(user.department);
    return this.buildLoginResponse(user);
  }

  async bindWechat(code: string, account: string, password: string) {
    const openid = await this.fetchWechatOpenId(code);
    const trimmed = account.trim();
    const employeeNo = trimmed.toUpperCase();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ employeeNo }, { phone: trimmed }, { username: trimmed.toLowerCase() }] },
      select: {
        id: true,
        name: true,
        employeeNo: true,
        role: true,
        departmentId: true,
        avatar: true,
        authVersion: true,
        status: true,
        shareCode: true,
        passwordHash: true,
        department: { select: { id: true, name: true, type: true, status: true, parentId: true } },
      },
    });
    if (!user) throw new UnauthorizedException('账号或密码错误');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('账号已禁用');
    if (!user.passwordHash) throw new UnauthorizedException('该账号不支持系统登录');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('账号或密码错误');
    await this.ensureMiniAppDepartmentAccess(user.department);
    await this.prisma.user.update({ where: { id: user.id }, data: { wechatOpenId: openid } });
    return this.buildLoginResponse(user);
  }

  private async ensureMiniAppDepartmentAccess(
    department: { id: string; name: string; type: string; status: string; parentId?: string | null } | null,
  ) {
    if (!department || department.status !== 'ACTIVE') {
      throw new UnauthorizedException('当前账号未分配可用部门');
    }
    if (canDepartmentLoginMiniApp(department.type, department.name)) return;

    let parentId = department.parentId;
    for (let depth = 0; parentId && depth < 8; depth += 1) {
      const parent = await this.prisma.department.findUnique({
        where: { id: parentId },
        select: { id: true, name: true, type: true, status: true, parentId: true },
      });
      if (!parent || parent.status !== 'ACTIVE') break;
      if (canDepartmentLoginMiniApp(parent.type, parent.name)) return;
      parentId = parent.parentId;
    }

    throw new UnauthorizedException('当前账号无小程序登录权限');
  }
}
