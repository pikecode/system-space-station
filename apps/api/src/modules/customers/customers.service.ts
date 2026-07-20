import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { TransferCustomerDto } from './dto/transfer-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';

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

    if (currentUser.role === 'MEMBER') {
      where.assignedTo = currentUser.id;
    } else if (currentUser.role === 'HEAD') {
      where.departmentId = currentUser.departmentId;
    } else {
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
    this.checkAccess(customer, currentUser);
    return customer;
  }

  async create(dto: CreateCustomerDto, currentUser: any) {
    if (!currentUser.departmentId) throw new BadRequestException('账号未关联部门');
    const { birthday, source, gender, ...rest } = dto;
    return this.prisma.customer.create({
      data: {
        ...rest,
        ...(source !== undefined ? { source } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(birthday ? { birthday: new Date(birthday) } : {}),
        assignedTo: currentUser.id,
        createdBy: currentUser.id,
        departmentId: currentUser.departmentId as string,
      } as Prisma.CustomerUncheckedCreateInput,
    });
  }

  async update(id: string, dto: UpdateCustomerDto, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    this.checkAccess(customer, currentUser);
    const { birthday, ...rest } = dto;
    return this.prisma.customer.update({
      where: { id },
      data: { ...rest, ...(birthday ? { birthday: new Date(birthday) } : {}) },
    });
  }

  async transfer(id: string, dto: TransferCustomerDto, currentUser: any) {
    if (!['HEAD', 'ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('只有部门负责人可以转移维护人');
    }
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    if (currentUser.role === 'HEAD' && customer.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('只能转移本部门客户');
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
    return this.prisma.customer.update({
      where: { id },
      data: { assignedTo: dto.newAssignedTo },
    });
  }

  async disable(id: string, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('客户不存在');
    this.checkAccess(customer, currentUser);
    return this.prisma.customer.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  private checkAccess(customer: any, currentUser: any) {
    if (currentUser.role === 'ADMIN') return;
    if (currentUser.role === 'HEAD' && customer.departmentId === currentUser.departmentId) return;
    if (currentUser.role === 'MEMBER' && customer.assignedTo === currentUser.id) return;
    throw new ForbiddenException('无权访问该客户');
  }
}
