import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TransferUserDto } from './dto/transfer-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SensitiveDataService } from '../../common/security/sensitive-data.service';

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  phone: true,
  employeeNo: true,
  gender: true,
  birthDate: true,
  alternatePhone: true,
  wechat: true,
  province: true,
  city: true,
  district: true,
  addressDetail: true,
  idCardMasked: true,
  email: true,
  avatar: true,
  positionId: true,
  role: true,
  departmentId: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  position: true,
  department: { select: { id: true, name: true, type: true } },
  headOf: { select: { id: true, name: true, type: true } },
} satisfies Prisma.UserSelect;

type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private sensitiveData: SensitiveDataService,
  ) {}

  async findAll(query: {
    departmentId?: string;
    role?: string;
    status?: string;
    employeeNo?: string;
    username?: string;
    name?: string;
    phone?: string;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.role) where.role = query.role as UserRole;
    if (query.status) where.status = query.status as UserStatus;
    if (query.employeeNo) where.employeeNo = { contains: query.employeeNo, mode: 'insensitive' };
    if (query.username) where.username = { contains: query.username, mode: 'insensitive' };
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.phone) where.phone = { contains: query.phone };

    return this.prisma.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async findDepartmentMembers(departmentId: string) {
    return this.prisma.user.findMany({
      where: { departmentId, status: UserStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        role: true,
        departmentId: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto, operatorId: string) {
    if (dto.role !== UserRole.ADMIN && !dto.departmentId) {
      throw new BadRequestException('员工必须指定所属部门');
    }
    if (dto.role === UserRole.ADMIN && !dto.username) {
      throw new BadRequestException('系统管理员必须设置用户名');
    }
    if (dto.role !== UserRole.ADMIN && dto.username) {
      throw new BadRequestException('只有系统管理员可以设置用户名');
    }
    if (dto.role !== UserRole.ADMIN && !dto.employeeNo) {
      throw new BadRequestException('员工必须填写工号');
    }

    const protectedIdentityCard = dto.idCardNo
      ? this.sensitiveData.protectIdentityCard(dto.idCardNo)
      : undefined;
    await this.ensureUniqueFields({
      phone: dto.phone,
      username: dto.username,
      employeeNo: dto.employeeNo,
      idCardHash: protectedIdentityCard?.hash,
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.$transaction(async (tx) => {
      if (dto.departmentId) {
        const department = await tx.department.findUnique({ where: { id: dto.departmentId } });
        if (!department || department.status !== 'ACTIVE') {
          throw new NotFoundException('所属部门不存在或已停用');
        }
      }

      const user = await tx.user.create({
        data: {
          name: dto.name,
          username: dto.username,
          phone: dto.phone,
          employeeNo: dto.employeeNo,
          gender: dto.gender,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          alternatePhone: dto.alternatePhone,
          wechat: dto.wechat,
          province: dto.province,
          city: dto.city,
          district: dto.district,
          addressDetail: dto.addressDetail,
          idCardEncrypted: protectedIdentityCard?.encrypted,
          idCardHash: protectedIdentityCard?.hash,
          idCardMasked: protectedIdentityCard?.masked,
          email: dto.email,
          positionId: dto.positionId,
          passwordHash,
          role: dto.role,
          departmentId: dto.departmentId,
        },
        select: safeUserSelect,
      });

      if (dto.role === UserRole.HEAD && dto.departmentId) {
        const assigned = await tx.department.updateMany({
          where: { id: dto.departmentId, headId: null },
          data: { headId: user.id },
        });
        if (assigned.count !== 1) throw new ConflictException('该部门已有负责人');
      }

      await tx.auditLog.create({
        data: {
          action: 'USER_CREATE',
          entityType: 'User',
          entityId: user.id,
          operatorId,
          after: this.userAuditSnapshot(user),
        },
      });
      return user;
    });
  }

  async update(id: string, dto: UpdateUserDto, operatorId: string) {
    const existing = await this.findOne(id);
    if (existing.role !== UserRole.ADMIN && dto.username !== undefined) {
      throw new BadRequestException('只有系统管理员可以设置用户名');
    }
    if (existing.role === UserRole.ADMIN && dto.username === '') {
      throw new BadRequestException('系统管理员用户名不能为空');
    }
    if (existing.role !== UserRole.ADMIN && dto.employeeNo === '') {
      throw new BadRequestException('员工工号不能为空');
    }

    const protectedIdentityCard = dto.idCardNo
      ? this.sensitiveData.protectIdentityCard(dto.idCardNo)
      : undefined;
    await this.ensureUniqueFields({
      phone: dto.phone,
      username: dto.username,
      employeeNo: dto.employeeNo,
      idCardHash: protectedIdentityCard?.hash,
    }, id);

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.employeeNo !== undefined) updateData.employeeNo = dto.employeeNo || null;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.birthDate !== undefined) updateData.birthDate = new Date(dto.birthDate);
    if (dto.alternatePhone !== undefined) updateData.alternatePhone = dto.alternatePhone || null;
    if (dto.wechat !== undefined) updateData.wechat = dto.wechat || null;
    if (dto.province !== undefined) updateData.province = dto.province || null;
    if (dto.city !== undefined) updateData.city = dto.city || null;
    if (dto.district !== undefined) updateData.district = dto.district || null;
    if (dto.addressDetail !== undefined) updateData.addressDetail = dto.addressDetail || null;
    if (protectedIdentityCard) {
      updateData.idCardEncrypted = protectedIdentityCard.encrypted;
      updateData.idCardHash = protectedIdentityCard.hash;
      updateData.idCardMasked = protectedIdentityCard.masked;
    }
    if (dto.email !== undefined) updateData.email = dto.email || null;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.positionId !== undefined) {
      updateData.position = dto.positionId
        ? { connect: { id: dto.positionId } }
        : { disconnect: true };
    }
    if (dto.newPassword) {
      updateData.passwordHash = await bcrypt.hash(dto.newPassword, 12);
      updateData.authVersion = { increment: 1 };
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        select: safeUserSelect,
      });
      await tx.auditLog.create({
        data: {
          action: 'USER_UPDATE',
          entityType: 'User',
          entityId: id,
          operatorId,
          before: this.userAuditSnapshot(existing),
          after: this.userAuditSnapshot(user),
        },
      });
      return user;
    });
  }

  async transfer(id: string, dto: TransferUserDto, operatorId: string) {
    const user = await this.findOne(id);
    const newRole = dto.newRole ?? user.role;

    return this.prisma.$transaction(async (tx) => {
      const targetDepartment = await tx.department.findUnique({
        where: { id: dto.newDepartmentId },
      });
      if (!targetDepartment || targetDepartment.status !== 'ACTIVE') {
        throw new NotFoundException('目标部门不存在或已停用');
      }

      const leavingHeadPosition =
        !!user.headOf &&
        (user.headOf.id !== dto.newDepartmentId || newRole !== UserRole.HEAD);
      if (leavingHeadPosition) {
        const successor = await this.requireSuccessor(tx, user, dto.successorId);
        await tx.department.update({
          where: { id: user.headOf!.id },
          data: { headId: successor.id },
        });
        if (successor.role !== UserRole.HEAD) {
          await tx.user.update({
            where: { id: successor.id },
            data: { role: UserRole.HEAD, authVersion: { increment: 1 } },
          });
        }
      }

      if (newRole === UserRole.HEAD) {
        const currentHead = await tx.department.findUnique({
          where: { id: dto.newDepartmentId },
          select: { headId: true },
        });
        if (currentHead?.headId && currentHead.headId !== id) {
          throw new ConflictException('目标部门已有负责人');
        }
        await tx.department.update({
          where: { id: dto.newDepartmentId },
          data: { headId: id },
        });
      }

      if (user.departmentId !== dto.newDepartmentId) {
        await tx.customer.updateMany({
          where: { assignedTo: id },
          data: { departmentId: dto.newDepartmentId },
        });
      }

      const updated = await tx.user.update({
        where: { id },
        data: {
          departmentId: dto.newDepartmentId,
          role: newRole,
          authVersion: { increment: 1 },
        },
        select: safeUserSelect,
      });
      await tx.auditLog.create({
        data: {
          action: 'USER_TRANSFER',
          entityType: 'User',
          entityId: id,
          operatorId,
          before: this.userAuditSnapshot(user),
          after: this.userAuditSnapshot(updated),
        },
      });
      return updated;
    });
  }

  async setStatus(
    id: string,
    status: UserStatus,
    successorId: string | undefined,
    operatorId: string,
  ) {
    const user = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      if (user.headOf && status === UserStatus.INACTIVE) {
        const successor = await this.requireSuccessor(tx, user, successorId);
        await tx.department.update({
          where: { id: user.headOf.id },
          data: { headId: successor.id },
        });
        if (successor.role !== UserRole.HEAD) {
          await tx.user.update({
            where: { id: successor.id },
            data: { role: UserRole.HEAD, authVersion: { increment: 1 } },
          });
        }
      }

      if (user.role === UserRole.HEAD && status === UserStatus.ACTIVE && user.departmentId) {
        const department = await tx.department.findUnique({
          where: { id: user.departmentId },
          select: { headId: true },
        });
        if (department?.headId && department.headId !== id) {
          throw new ConflictException('所属部门已有负责人，无法直接启用该负责人');
        }
        await tx.department.update({
          where: { id: user.departmentId },
          data: { headId: id },
        });
      }

      const updated = await tx.user.update({
        where: { id },
        data: { status, authVersion: { increment: 1 } },
        select: safeUserSelect,
      });
      await tx.auditLog.create({
        data: {
          action: 'USER_STATUS_CHANGE',
          entityType: 'User',
          entityId: id,
          operatorId,
          before: this.userAuditSnapshot(user),
          after: this.userAuditSnapshot(updated),
        },
      });
      return updated;
    });
  }

  private async requireSuccessor(
    tx: Prisma.TransactionClient,
    user: SafeUser,
    successorId?: string,
  ) {
    if (!successorId) throw new BadRequestException('请先指定旧部门接任负责人');
    if (successorId === user.id) throw new BadRequestException('接任者不能是本人');

    const successor = await tx.user.findUnique({ where: { id: successorId } });
    if (!successor) throw new NotFoundException('接任者不存在');
    if (successor.status !== UserStatus.ACTIVE) throw new BadRequestException('接任者必须是在职用户');
    if (successor.departmentId !== user.headOf?.id) {
      throw new BadRequestException('接任者必须属于原部门');
    }
    return successor;
  }

  private async ensureUniqueFields(
    fields: {
      phone?: string;
      username?: string;
      employeeNo?: string;
      idCardHash?: string;
    },
    excludedUserId?: string,
  ) {
    const conditions: Prisma.UserWhereInput[] = [];
    if (fields.phone) conditions.push({ phone: fields.phone });
    if (fields.username) conditions.push({ username: fields.username });
    if (fields.employeeNo) conditions.push({ employeeNo: fields.employeeNo });
    if (fields.idCardHash) conditions.push({ idCardHash: fields.idCardHash });
    if (conditions.length === 0) return;

    const conflict = await this.prisma.user.findFirst({
      where: {
        ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
        OR: conditions,
      },
      select: { phone: true, username: true, employeeNo: true, idCardHash: true },
    });
    if (!conflict) return;
    if (fields.phone && conflict.phone === fields.phone) {
      throw new ConflictException('该手机号已被注册');
    }
    if (fields.username && conflict.username === fields.username) {
      throw new ConflictException('该用户名已被使用');
    }
    if (fields.employeeNo && conflict.employeeNo === fields.employeeNo) {
      throw new ConflictException('该工号已被使用');
    }
    throw new ConflictException('该身份证号码已被使用');
  }

  private userAuditSnapshot(user: SafeUser): Prisma.InputJsonObject {
    return {
      name: user.name,
      username: user.username ?? '',
      phone: user.phone,
      employeeNo: user.employeeNo ?? '',
      gender: user.gender ?? '',
      birthDate: user.birthDate?.toISOString() ?? '',
      alternatePhone: user.alternatePhone ?? '',
      wechat: user.wechat ?? '',
      province: user.province ?? '',
      city: user.city ?? '',
      district: user.district ?? '',
      addressDetail: user.addressDetail ?? '',
      role: user.role,
      departmentId: user.departmentId,
      status: user.status,
      positionId: user.positionId,
    };
  }
}
