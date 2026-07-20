import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransferUserDto } from './dto/transfer-user.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { departmentId?: string; role?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;

    return this.prisma.user.findMany({
      where,
      include: {
        position: true,
        department: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        position: true,
        department: { select: { id: true, name: true, type: true } },
        headOf: { select: { id: true, name: true, type: true } },
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (dto.role === UserRole.HEAD && dto.departmentId) {
      const dept = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept) throw new NotFoundException('部门不存在');
      if (dept.headId) throw new ConflictException('该部门已有负责人');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          positionId: dto.positionId,
          passwordHash,
          role: dto.role,
          departmentId: dto.departmentId,
        },
      });

      if (dto.role === UserRole.HEAD && dto.departmentId) {
        await tx.department.update({
          where: { id: dto.departmentId },
          data: { headId: user.id },
        });
      }

      return user;
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    const roleChanged = dto.role !== undefined && dto.role !== user.role;
    const statusChanged = false; // status changes go through setStatus

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.positionId !== undefined) updateData.positionId = dto.positionId;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.role !== undefined) updateData.role = dto.role;

    if (dto.newPassword) {
      updateData.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    }

    if (roleChanged || statusChanged) {
      updateData.authVersion = { increment: 1 };
    }

    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  async transfer(id: string, dto: TransferUserDto) {
    const user = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Handle old department HEAD succession
      if (user.role === UserRole.HEAD) {
        if (!dto.successorId) {
          throw new BadRequestException('请先指定旧部门接任负责人');
        }

        const successor = await tx.user.findUnique({ where: { id: dto.successorId } });
        if (!successor) throw new NotFoundException('接任者不存在');
        if (successor.departmentId !== user.departmentId) {
          throw new BadRequestException('接任者必须属于同一部门');
        }

        // Update old department head
        if (user.departmentId) {
          await tx.department.update({
            where: { id: user.departmentId },
            data: { headId: dto.successorId },
          });
        }
      }

      // Migrate all customers to new department
      await tx.customer.updateMany({
        where: { assignedTo: id },
        data: { departmentId: dto.newDepartmentId },
      });

      const newRole = dto.newRole ?? user.role;

      // If new role is HEAD, check new department has no head
      if (newRole === UserRole.HEAD) {
        const newDept = await tx.department.findUnique({
          where: { id: dto.newDepartmentId },
        });
        if (!newDept) throw new NotFoundException('目标部门不存在');
        if (newDept.headId && newDept.headId !== id) {
          throw new ConflictException('目标部门已有负责人');
        }
        await tx.department.update({
          where: { id: dto.newDepartmentId },
          data: { headId: id },
        });
      }

      // Update user
      return tx.user.update({
        where: { id },
        data: {
          departmentId: dto.newDepartmentId,
          role: newRole,
          authVersion: { increment: 1 },
        },
      });
    });
  }

  async setStatus(id: string, status: UserStatus, successorId?: string) {
    const user = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // If disabling a HEAD, require successor first
      if (user.role === UserRole.HEAD && status === UserStatus.INACTIVE) {
        if (!successorId) {
          throw new BadRequestException('请先指定接任负责人后再禁用');
        }

        const successor = await tx.user.findUnique({ where: { id: successorId } });
        if (!successor) throw new NotFoundException('接任者不存在');
        if (successor.departmentId !== user.departmentId) {
          throw new BadRequestException('接任者必须属于同一部门');
        }

        if (user.departmentId) {
          await tx.department.update({
            where: { id: user.departmentId },
            data: { headId: successorId },
          });
        }
      }

      return tx.user.update({
        where: { id },
        data: {
          status,
          authVersion: { increment: 1 },
        },
      });
    });
  }
}
