import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentType } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      where: { status: 'ACTIVE' },
      include: { head: { select: { id: true, name: true } } },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findTree() {
    const all = await this.prisma.department.findMany({
      where: { status: 'ACTIVE' },
      include: { head: { select: { id: true, name: true } } },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
    return this.buildTree(all, null);
  }

  private buildTree(all: any[], parentId: string | null): any[] {
    return all
      .filter((d) => d.parentId === parentId)
      .map((d) => ({ ...d, children: this.buildTree(all, d.id) }));
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, type: true } },
        children: { select: { id: true, name: true, type: true, status: true } },
      },
    });
    if (!dept) throw new NotFoundException('部门不存在');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    if (dto.type === DepartmentType.HQ) {
      const existing = await this.prisma.department.findFirst({ where: { type: 'HQ' } });
      if (existing) throw new ConflictException('总部已存在，只允许一个');
    }
    if (dto.type === DepartmentType.MARKET) {
      const count = await this.prisma.department.count({ where: { type: 'MARKET', status: 'ACTIVE' } });
      if (count >= 7) throw new BadRequestException('市场部最多7个');
    }
    return this.prisma.department.create({ data: dto });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    if (dto.type === DepartmentType.HQ) {
      const existing = await this.prisma.department.findFirst({
        where: { type: 'HQ', id: { not: id } },
      });
      if (existing) throw new ConflictException('总部已存在');
    }
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async disable(id: string) {
    await this.findOne(id);
    const hasActiveMembers = await this.prisma.user.count({
      where: { departmentId: id, status: 'ACTIVE' },
    });
    if (hasActiveMembers > 0) throw new BadRequestException('部门下有在职员工，无法停用');
    return this.prisma.department.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
