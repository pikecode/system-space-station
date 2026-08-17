import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { TransferCustomerDto } from './dto/transfer-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { resolveDataScope, canWrite } from '../../common/data-scope';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any, query: QueryCustomerDto) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);
    const skip = (page - 1) * pageSize;

    const where: Record<string, any> = {};
    if (!query.status) where.status = 'ACTIVE';
    else where.status = query.status;

    const scope = resolveDataScope(currentUser);

    if (scope.type === 'SELF') {
      where.assignedTo = scope.userId;
    } else if (scope.type === 'DEPARTMENT') {
      where.departmentId = scope.departmentId;
    } else if (scope.type === 'MARKET_TREE') {
      const divisionDepts = await this.prisma.department.findMany({
        where: { parentId: scope.marketDeptId, status: 'ACTIVE' },
        select: { id: true },
      });
      const deptIds = [scope.marketDeptId!, ...divisionDepts.map((d) => d.id)];
      where.departmentId = { in: deptIds };
    } else {
      // ALL_READONLY or ALL_WRITABLE — ADMIN may filter by dept/assignee
      if (query.departmentId) where.departmentId = query.departmentId;
      if (query.assignedTo) where.assignedTo = query.assignedTo;
    }

    if (query.customerType) where.customerType = query.customerType;
    if (query.source) where.source = query.source;
    if (query.name) where.name = { contains: query.name };
    if (query.phone) where.phone = { contains: query.phone };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where, skip, take: pageSize,
        include: {
          assignedUser: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, page, pageSize, data };
  }

  async findOne(id: string, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true, memberNo: true, status: true, fee: true,
            startDate: true, endDate: true,
            memberLevel: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('客户不存在');
    await this.checkAccess(customer, currentUser);
    return customer;
  }

  async create(dto: CreateCustomerDto, currentUser: any) {
    let owner: { id: string; departmentId: string | null; status: string } | null = null;

    if (currentUser.role === 'ADMIN') {
      if (!dto.assignedUserId) throw new BadRequestException('请指定客户归属人');
      owner = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
        select: { id: true, departmentId: true, status: true },
      });
      if (!owner) throw new BadRequestException('指定归属人不存在');
      if (owner.status !== 'ACTIVE') throw new BadRequestException('归属人已停用');
      if (!owner.departmentId) throw new BadRequestException('归属人未分配部门');
    } else if (dto.shareCode) {
      owner = await this.prisma.user.findUnique({
        where: { shareCode: dto.shareCode },
        select: { id: true, departmentId: true, status: true },
      });
      if (!owner) throw new BadRequestException('分享码无效');
      if (owner.status !== 'ACTIVE') throw new BadRequestException('分享码用户已停用');
      if (!owner.departmentId) throw new BadRequestException('分享码用户未分配部门');
    } else {
      owner = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { id: true, departmentId: true, status: true },
      });
      if (!owner || owner.status !== 'ACTIVE') throw new BadRequestException('当前账号不可用');
      if (!owner.departmentId) throw new BadRequestException('当前账号未分配部门');
    }

    const { birthday, source, gender, ...rest } = dto;
    delete (rest as Partial<CreateCustomerDto>).shareCode;
    delete (rest as Partial<CreateCustomerDto>).assignedUserId;
    const registrationSource = currentUser.role === 'ADMIN'
      ? 'ADMIN'
      : dto.shareCode ? 'PARTNER' : 'SELF';
    return this.prisma.customer.create({
      data: {
        ...rest,
        ...(source !== undefined ? { source } : { source: 'REFERRAL' }),
        ...(gender !== undefined ? { gender } : {}),
        ...(birthday ? { birthday: new Date(birthday) } : {}),
        assignedTo: owner.id,
        referredBy: dto.shareCode ? owner.id : null,
        departmentId: owner.departmentId as string,
        createdBy: currentUser.id,
        registrationSource,
      } as Prisma.CustomerUncheckedCreateInput,
    });
  }

  async update(id: string, dto: UpdateCustomerDto, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    await this.checkAccess(customer, currentUser, true);
    const { birthday, ...rest } = dto;
    return this.prisma.customer.update({
      where: { id },
      data: { ...rest, ...(birthday ? { birthday: new Date(birthday) } : {}) },
    });
  }

  async transfer(id: string, dto: TransferCustomerDto, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    await this.checkAccess(customer, currentUser, true);

    const scope = resolveDataScope(currentUser);
    if (scope.type === 'SELF') {
      throw new ForbiddenException('当前角色无客户转移权限');
    }
    const newUser = await this.prisma.user.findUnique({
      where: { id: dto.newAssignedTo },
      select: { id: true, departmentId: true, status: true },
    });
    if (!newUser) throw new NotFoundException('目标维护人不存在');
    if (newUser.status === 'INACTIVE') throw new BadRequestException('目标用户已禁用');
    if (newUser.departmentId !== customer.departmentId) {
      throw new BadRequestException('目标维护人不在同一部门');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id },
        data: { assignedTo: dto.newAssignedTo },
      });
      await tx.auditLog.create({
        data: {
          action: 'CUSTOMER_TRANSFER',
          entityType: 'Customer',
          entityId: id,
          operatorId: currentUser.id,
          before: { assignedTo: customer.assignedTo, departmentId: customer.departmentId },
          after: { assignedTo: dto.newAssignedTo, departmentId: customer.departmentId },
        },
      });
      return updated;
    });
  }

  async disable(id: string, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    await this.checkAccess(customer, currentUser, true);
    return this.prisma.customer.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  private async checkAccess(customer: any, currentUser: any, requireWrite = false) {
    if (currentUser.role === 'ADMIN') return;

    const scope = resolveDataScope(currentUser);

    if (requireWrite && !canWrite(scope)) {
      throw new ForbiddenException('当前角色仅有查看权限，无法修改客户');
    }

    switch (scope.type) {
      case 'SELF':
        if (customer.assignedTo !== currentUser.id) throw new ForbiddenException('无权访问该客户');
        break;
      case 'DEPARTMENT':
        if (customer.departmentId !== scope.departmentId) throw new ForbiddenException('无权访问该客户');
        break;
      case 'MARKET_TREE': {
        const divisionDepts = await this.prisma.department.findMany({
          where: { parentId: scope.marketDeptId, status: 'ACTIVE' },
          select: { id: true },
        });
        const deptIds = new Set([scope.marketDeptId!, ...divisionDepts.map((d) => d.id)]);
        if (!deptIds.has(customer.departmentId)) throw new ForbiddenException('无权访问该客户');
        break;
      }
      case 'ALL_READONLY':
      case 'ALL_WRITABLE':
        break;
    }
  }
}
