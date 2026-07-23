import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

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
    const all = await this.findAll();
    return this.buildTree(all, null, new Set());
  }

  private buildTree(all: any[], parentId: string | null, ancestors: Set<string>): any[] {
    return all
      .filter((department) => department.parentId === parentId)
      .map((department) => {
        if (ancestors.has(department.id)) {
          throw new ConflictException('部门层级存在循环引用，请联系管理员修复');
        }
        const nextAncestors = new Set(ancestors).add(department.id);
        return {
          ...department,
          children: this.buildTree(all, department.id, nextAncestors),
        };
      });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true, type: true } },
        children: { select: { id: true, name: true, type: true, status: true } },
      },
    });
    if (!department) throw new NotFoundException('部门不存在');
    return department;
  }

  async create(dto: CreateDepartmentDto, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.validateHierarchy(tx, dto.type, dto.parentId ?? null);
      if (dto.type === DepartmentType.HQ) {
        const existing = await tx.department.findFirst({ where: { type: DepartmentType.HQ } });
        if (existing) throw new ConflictException('总部已存在，只允许一个');
      }

      const department = await tx.department.create({ data: dto });
      await tx.auditLog.create({
        data: {
          action: 'DEPARTMENT_CREATE',
          entityType: 'Department',
          entityId: department.id,
          operatorId,
          after: this.auditSnapshot(department),
        },
      });
      return department;
    });
  }

  async update(id: string, dto: UpdateDepartmentDto, operatorId: string) {
    const existing = await this.findOne(id);
    const nextType = dto.type ?? existing.type;
    const nextParentId = dto.parentId === undefined ? existing.parentId : dto.parentId;

    return this.prisma.$transaction(async (tx) => {
      await this.validateHierarchy(tx, nextType, nextParentId, id);
      if (existing.type === DepartmentType.HQ && nextType !== DepartmentType.HQ) {
        throw new BadRequestException('总部类型不能变更');
      }
      if (nextType === DepartmentType.HQ) {
        const anotherHeadquarters = await tx.department.findFirst({
          where: { type: DepartmentType.HQ, id: { not: id } },
        });
        if (anotherHeadquarters) throw new ConflictException('总部已存在');
      }
      if (nextType !== existing.type) {
        await this.validateChildrenForType(tx, id, nextType);
      }

      if (dto.headId !== undefined && dto.headId !== existing.headId) {
        if (dto.headId) {
          const newHead = await tx.user.findUnique({ where: { id: dto.headId } });
          if (!newHead || newHead.status !== 'ACTIVE') {
            throw new BadRequestException('新负责人不存在或已禁用');
          }
          if (newHead.departmentId !== id) {
            throw new BadRequestException('负责人必须属于当前部门');
          }
          if (newHead.role !== UserRole.HEAD) {
            await tx.user.update({
              where: { id: newHead.id },
              data: { role: UserRole.HEAD, authVersion: { increment: 1 } },
            });
          }
        }
        if (existing.headId) {
          await tx.user.update({
            where: { id: existing.headId },
            data: { role: UserRole.MEMBER, authVersion: { increment: 1 } },
          });
        }
      }

      const department = await tx.department.update({ where: { id }, data: dto });
      await tx.auditLog.create({
        data: {
          action: 'DEPARTMENT_UPDATE',
          entityType: 'Department',
          entityId: id,
          operatorId,
          before: this.auditSnapshot(existing),
          after: this.auditSnapshot(department),
        },
      });
      return department;
    });
  }

  async disable(id: string, operatorId: string) {
    const existing = await this.findOne(id);
    const [activeMembers, activeChildren] = await Promise.all([
      this.prisma.user.count({ where: { departmentId: id, status: 'ACTIVE' } }),
      this.prisma.department.count({ where: { parentId: id, status: 'ACTIVE' } }),
    ]);
    if (activeMembers > 0) throw new BadRequestException('部门下有在职员工，无法停用');
    if (activeChildren > 0) throw new BadRequestException('部门下有启用的子部门，无法停用');

    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      await tx.auditLog.create({
        data: {
          action: 'DEPARTMENT_DISABLE',
          entityType: 'Department',
          entityId: id,
          operatorId,
          before: this.auditSnapshot(existing),
          after: this.auditSnapshot(department),
        },
      });
      return department;
    });
  }

  private async validateHierarchy(
    tx: Prisma.TransactionClient,
    type: DepartmentType,
    parentId: string | null,
    currentId?: string,
  ) {
    if (type === DepartmentType.GOVERNANCE) {
      if (parentId === currentId) throw new BadRequestException('部门不能将自身设为上级');
      if (parentId) {
        const parent = await tx.department.findUnique({ where: { id: parentId } });
        if (!parent || parent.status !== 'ACTIVE') throw new BadRequestException('上级部门不存在或已停用');
        if (parent.type !== DepartmentType.GOVERNANCE) throw new BadRequestException('治理层的上级必须也是治理层');
      }
      return;
    }
    if (type === DepartmentType.HQ) {
      if (parentId) {
        if (parentId === currentId) throw new BadRequestException('部门不能将自身设为上级');
        const parent = await tx.department.findUnique({ where: { id: parentId } });
        if (!parent || parent.status !== 'ACTIVE') throw new BadRequestException('上级部门不存在或已停用');
        if (parent.type !== DepartmentType.GOVERNANCE) throw new BadRequestException('总经办的上级必须是治理层');
      }
      return;
    }
    if (!parentId) throw new BadRequestException('非总部部门必须设置上级部门');
    if (parentId === currentId) throw new BadRequestException('部门不能将自身设为上级');

    const parent = await tx.department.findUnique({ where: { id: parentId } });
    if (!parent || parent.status !== 'ACTIVE') {
      throw new BadRequestException('上级部门不存在或已停用');
    }
    const validParentTypes: Record<Exclude<DepartmentType, 'HQ' | 'GOVERNANCE'>, DepartmentType[]> = {
      CENTER: [DepartmentType.HQ],
      DIRECT: [DepartmentType.HQ, DepartmentType.CENTER],
      MARKET: [DepartmentType.CENTER],
      DIVISION: [DepartmentType.MARKET],
    };
    if (!validParentTypes[type as Exclude<DepartmentType, 'HQ' | 'GOVERNANCE'>].includes(parent.type)) {
      throw new BadRequestException('部门类型与上级部门层级不匹配');
    }

    let ancestor: typeof parent | null = parent;
    let depth = 1;
    while (ancestor?.parentId) {
      if (ancestor.parentId === currentId) throw new BadRequestException('部门层级不能形成循环');
      depth += 1;
      if (depth > 4) throw new BadRequestException('部门层级最多五层');
      ancestor = await tx.department.findUnique({ where: { id: ancestor.parentId } });
    }
  }

  private async validateChildrenForType(
    tx: Prisma.TransactionClient,
    departmentId: string,
    parentType: DepartmentType,
  ) {
    const children = await tx.department.findMany({
      where: { parentId: departmentId },
      select: { type: true },
    });
    const allowedChildTypes: Record<DepartmentType, DepartmentType[]> = {
      GOVERNANCE: [DepartmentType.GOVERNANCE, DepartmentType.HQ],
      HQ: [DepartmentType.CENTER, DepartmentType.DIRECT],
      CENTER: [DepartmentType.DIRECT, DepartmentType.MARKET],
      MARKET: [DepartmentType.DIVISION],
      DIRECT: [],
      DIVISION: [],
    };
    if (children.some((child) => !allowedChildTypes[parentType].includes(child.type))) {
      throw new BadRequestException('变更部门类型后将与现有子部门层级冲突');
    }
  }

  private auditSnapshot(department: {
    name: string;
    code?: string | null;
    type: DepartmentType;
    parentId: string | null;
    headId: string | null;
    status: string;
  }): Prisma.InputJsonObject {
    return {
      name: department.name,
      code: department.code ?? '',
      type: department.type,
      parentId: department.parentId ?? '',
      headId: department.headId ?? '',
      status: department.status,
    };
  }
}
