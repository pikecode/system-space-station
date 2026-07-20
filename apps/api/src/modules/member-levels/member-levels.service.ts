import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberLevelDto } from './dto/create-member-level.dto';

@Injectable()
export class MemberLevelsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.memberLevel.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  create(dto: CreateMemberLevelDto) {
    return this.prisma.memberLevel.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateMemberLevelDto>) {
    const existing = await this.prisma.memberLevel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('会员等级不存在');
    return this.prisma.memberLevel.update({ where: { id }, data: dto });
  }

  async disable(id: string) {
    const existing = await this.prisma.memberLevel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('会员等级不存在');
    const inUse = await this.prisma.membership.findFirst({
      where: { memberLevelId: id, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (inUse) throw new BadRequestException('该会员等级仍有进行中的会员，无法禁用');
    return this.prisma.memberLevel.update({ where: { id }, data: { status: 'INACTIVE' } });
  }
}
