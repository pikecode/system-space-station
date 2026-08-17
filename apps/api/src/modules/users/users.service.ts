import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentType, Prisma, UserRole, UserStatus, UserType } from '@prisma/client';
import { canDepartmentGenerateShareCode, getDepartmentCapacity } from 'shared';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TransferUserDto } from './dto/transfer-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { SensitiveDataService } from '../../common/security/sensitive-data.service';

const ADMIN_STATUS_LOCK_KEY = 8_120_260;

function positiveInteger(value: string | undefined, fallback: number, max?: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max === undefined ? parsed : Math.min(parsed, max);
}

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  phone: true,
  employeeNo: true,
  userType: true,
  hasLicense: true,
  licenseNo: true,
  shareCode: true,
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

  async findAll(query: QueryUserDto) {
    const page = positiveInteger(query.page, 1);
    const pageSize = positiveInteger(query.pageSize, 20, 100);
    const where: Prisma.UserWhereInput = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.role) where.role = query.role as UserRole;
    if (query.excludeRole) where.role = { not: query.excludeRole as UserRole };
    if (query.status) where.status = query.status as UserStatus;
    if (query.userType) where.userType = query.userType as UserType;
    if (query.employeeNo) where.employeeNo = { contains: query.employeeNo, mode: 'insensitive' };
    if (query.username) where.username = { contains: query.username, mode: 'insensitive' };
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.phone) where.phone = { contains: query.phone };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, page, pageSize, data };
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
        phone: true,
        employeeNo: true,
        userType: true,
        hasLicense: true,
        shareCode: true,
        role: true,
        status: true,
        departmentId: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  findCustomerOwners(keyword?: string) {
    return this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        role: { in: [UserRole.HEAD, UserRole.MEMBER] },
        departmentId: { not: null },
        ...(keyword ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' as const } },
            { phone: { contains: keyword } },
          ],
        } : {}),
      },
      select: { id: true, name: true, phone: true, role: true, departmentId: true },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
      take: 50,
    });
  }

  findAssignableMembers(keyword?: string) {
    return this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        role: UserRole.MEMBER,
        departmentId: null,
        ...(keyword ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' as const } },
            { phone: { contains: keyword } },
          ],
        } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        userType: true,
        role: true,
        departmentId: true,
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
      take: 50,
    });
  }

  findOrganizationMembers() {
    return this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE, departmentId: { not: null } },
      select: {
        id: true,
        name: true,
        phone: true,
        employeeNo: true,
        userType: true,
        role: true,
        departmentId: true,
      },
      orderBy: [{ departmentId: 'asc' }, { name: 'asc' }],
    });
  }

  async create(dto: CreateUserDto, operatorId: string) {
    const userType = dto.userType ?? UserType.EMPLOYEE;
    const isPartner = userType === UserType.PARTNER;

    if (dto.role !== UserRole.ADMIN && !dto.departmentId) {
      throw new BadRequestException('员工必须指定所属部门');
    }
    if (dto.role === UserRole.ADMIN && !dto.username) {
      throw new BadRequestException('系统管理员必须设置用户名');
    }
    if (dto.role !== UserRole.ADMIN && dto.username) {
      throw new BadRequestException('只有系统管理员可以设置用户名');
    }
    if (!isPartner && !dto.password) {
      throw new BadRequestException('员工必须设置密码');
    }
    if (isPartner && dto.employeeNo && !dto.password) {
      throw new BadRequestException('有编号的合伙人必须设置密码');
    }

    const protectedIdentityCard = dto.idCardNo
      ? this.sensitiveData.protectIdentityCard(dto.idCardNo)
      : undefined;
    await this.ensureUniqueFields({
      phone: dto.phone,
      username: dto.username,
      idCardHash: protectedIdentityCard?.hash,
    });

    return this.prisma.$transaction(async (tx) => {
      let department = null;
      let employeeNo = dto.employeeNo?.trim().toUpperCase() || undefined;
      if (dto.departmentId) {
        department = await tx.department.findUnique({
          where: { id: dto.departmentId },
          select: { id: true, type: true, status: true, code: true },
        });
        if (!department || department.status !== 'ACTIVE') {
          throw new NotFoundException('所属部门不存在或已停用');
        }
        if (this.requiresManagedEmployeeNo(department.type)) {
          employeeNo = employeeNo ?? await this.generateNextEmployeeNo(tx, department);
          this.validateEmployeeNoForDepartment(employeeNo, department);
        }
        if (employeeNo) {
          await this.ensureEmployeeNoAvailable(tx, employeeNo);
          await this.validateDepartmentCapacity(tx, dto.departmentId, department.type);
        }
      }
      if (isPartner && employeeNo && !dto.password) {
        throw new BadRequestException('有编号的合伙人必须设置密码');
      }
      const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : null;

      // 营销中心成员（MARKET/DIVISION部门）自动生成分享码
      const needsShareCode = canDepartmentGenerateShareCode(department?.type);
      const shareCode = needsShareCode ? await this.generateShareCode(tx) : undefined;

      const user = await tx.user.create({
        data: {
          name: dto.name,
          username: dto.username,
          phone: dto.phone,
          employeeNo,
          userType,
          hasLicense: dto.hasLicense ?? false,
          licenseNo: dto.licenseNo,
          shareCode,
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
    if (dto.hasLicense !== undefined) updateData.hasLicense = dto.hasLicense;
    if (dto.licenseNo !== undefined) updateData.licenseNo = dto.licenseNo || null;
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
      if (dto.employeeNo && existing.departmentId) {
        const department = await tx.department.findUnique({
          where: { id: existing.departmentId },
          select: { type: true, code: true },
        });
        if (department) this.validateEmployeeNoForDepartment(dto.employeeNo, department);
      }
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
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('系统管理员不能加入业务部门');
    }
    const newRole = dto.newRole ?? user.role;

    return this.prisma.$transaction(async (tx) => {
      const targetDepartment = await tx.department.findUnique({
        where: { id: dto.newDepartmentId },
        select: { id: true, type: true, status: true, code: true },
      });
      if (!targetDepartment || targetDepartment.status !== 'ACTIVE') {
        throw new NotFoundException('目标部门不存在或已停用');
      }
      const isChangingDept = user.departmentId !== dto.newDepartmentId;
      const enteringManaged = isChangingDept && this.requiresManagedEmployeeNo(targetDepartment.type);

      if (enteringManaged) {
        await this.validateDepartmentCapacity(tx, dto.newDepartmentId, targetDepartment.type);
      }

      let nextEmployeeNo: string | null | undefined = user.employeeNo;
      if (isChangingDept) {
        if (enteringManaged) {
          nextEmployeeNo = await this.generateNextEmployeeNo(tx, targetDepartment, id);
        } else {
          // 离开管控部门（MARKET/DIVISION）时，编号归还给部门槽位
          const sourceDept = user.departmentId
            ? await tx.department.findUnique({
                where: { id: user.departmentId },
                select: { type: true },
              })
            : null;
          if (sourceDept && this.requiresManagedEmployeeNo(sourceDept.type)) {
            nextEmployeeNo = null;
          }
        }
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
          employeeNo: nextEmployeeNo,
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
    releaseEmployeeNo = false,
  ) {
    const user = await this.findOne(id);
    if (user.role === UserRole.ADMIN && status === UserStatus.INACTIVE && id === operatorId) {
      throw new BadRequestException('不能禁用当前登录的管理员账号');
    }
    return this.prisma.$transaction(async (tx) => {
      if (user.role === UserRole.ADMIN && status === UserStatus.INACTIVE) {
        await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(${ADMIN_STATUS_LOCK_KEY})`);
        const activeAdminCount = await tx.user.count({
          where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
        });
        if (activeAdminCount <= 1) {
          throw new ConflictException('至少需要保留一个启用状态的系统管理员');
        }
      }

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

      if (
        status === UserStatus.ACTIVE &&
        user.status !== UserStatus.ACTIVE &&
        user.departmentId &&
        user.employeeNo
      ) {
        const department = await tx.department.findUnique({
          where: { id: user.departmentId },
          select: { id: true, type: true, status: true },
        });
        if (!department || department.status !== 'ACTIVE') {
          throw new BadRequestException('所属部门不存在或已停用，无法启用该用户');
        }
        await this.validateDepartmentCapacity(tx, department.id, department.type);
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

      const shouldReleaseSlot =
        status === UserStatus.INACTIVE &&
        user.departmentId &&
        user.employeeNo &&
        (() => {
          // 管控部门（MARKET/DIVISION）离职时强制释放槽位编号
          const dept = user.department;
          return dept && this.requiresManagedEmployeeNo(dept.type);
        })();

      const updated = await tx.user.update({
        where: { id },
        data: {
          status,
          ...(shouldReleaseSlot || (status === UserStatus.INACTIVE && releaseEmployeeNo)
            ? { employeeNo: null }
            : {}),
          authVersion: { increment: 1 },
        },
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
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
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

  async removeFromDepartment(id: string, operatorId: string) {
    const user = await this.findOne(id);
    if (!user.departmentId) throw new BadRequestException('该用户不属于任何部门');
    if (user.headOf) throw new BadRequestException('部门负责人须先交接再移出');
    const assignedCustomerCount = await this.prisma.customer.count({
      where: { assignedTo: id, status: 'ACTIVE' },
    });
    if (assignedCustomerCount > 0) {
      throw new BadRequestException('该用户名下仍有客户，请先调岗或转移客户');
    }

    return this.prisma.$transaction(async (tx) => {
      const dept = user.department;
      const releaseNo = dept && this.requiresManagedEmployeeNo(dept.type);
      const updated = await tx.user.update({
        where: { id },
        data: {
          departmentId: null,
          role: UserRole.MEMBER,
          ...(releaseNo ? { employeeNo: null } : {}),
          authVersion: { increment: 1 },
        },
        select: safeUserSelect,
      });
      await tx.auditLog.create({
        data: {
          action: 'USER_REMOVE_DEPARTMENT',
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

  private async validateDepartmentCapacity(
    tx: Prisma.TransactionClient,
    departmentId: string,
    deptType: string,
  ) {
    const limit = getDepartmentCapacity(deptType);
    if (!limit) return;

    const count = await tx.user.count({
      where: { departmentId, status: 'ACTIVE', employeeNo: { not: null } },
    });
    if (count >= limit) {
      const label = deptType === 'MARKET' ? '市场部（1+2模式，上限3人）' : '事业部（7+1模式，上限8人）';
      throw new BadRequestException(`${label}已满员，无法继续加入`);
    }
  }

  private requiresManagedEmployeeNo(deptType: string) {
    return deptType === DepartmentType.MARKET || deptType === DepartmentType.DIVISION;
  }

  private validateEmployeeNoForDepartment(
    employeeNo: string,
    department: { type: string; code: string | null },
  ) {
    if (!this.requiresManagedEmployeeNo(department.type)) return;
    if (!department.code) throw new BadRequestException('部门未配置编号规则，无法分配编号');

    const expectedPattern =
      department.type === DepartmentType.MARKET
        ? /^MKT\d{4}$/
        : /^DIV\d{6}$/;
    if (!expectedPattern.test(employeeNo) || !employeeNo.startsWith(department.code)) {
      throw new BadRequestException(`编号必须以 ${department.code} 开头，并符合当前部门编号规则`);
    }
  }

  private async ensureEmployeeNoAvailable(
    tx: Prisma.TransactionClient,
    employeeNo: string,
    excludedUserId?: string,
  ) {
    const conflict = await tx.user.findFirst({
      where: {
        employeeNo,
        ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
      },
      select: { id: true },
    });
    if (conflict) throw new ConflictException('该工号已被使用');
  }

  private async generateNextEmployeeNo(
    tx: Prisma.TransactionClient,
    department: { id: string; type: string; code: string | null },
    excludedUserId?: string,
  ) {
    if (!department.code) throw new BadRequestException('部门未配置编号规则，无法自动生成编号');

    const limit = getDepartmentCapacity(department.type);
    if (!limit) throw new BadRequestException('当前部门不支持自动生成编号');

    const existing = await tx.user.findMany({
      where: {
        departmentId: department.id,
        employeeNo: { startsWith: department.code },
        ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
      },
      select: { employeeNo: true },
    });
    const usedSeats = new Set(
      existing
        .map((user) => user.employeeNo?.slice(department.code!.length))
        .filter((seat): seat is string => !!seat && /^\d{2}$/.test(seat)),
    );

    for (let seat = 1; seat <= limit; seat += 1) {
      const nextSeat = String(seat).padStart(2, '0');
      if (!usedSeats.has(nextSeat)) return `${department.code}${nextSeat}`;
    }

    const label = department.type === DepartmentType.MARKET ? '市场部（1+2模式，上限3人）' : '事业部（7+1模式，上限8人）';
    throw new BadRequestException(`${label}已满员，无法继续加入`);
  }

  private async generateShareCode(tx: Prisma.TransactionClient): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 6 }, () =>
        chars[randomInt(chars.length)],
      ).join('');
      const exists = await tx.user.findUnique({ where: { shareCode: code } });
      if (!exists) return code;
    }
    throw new BadRequestException('无法生成唯一分享码，请重试');
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
