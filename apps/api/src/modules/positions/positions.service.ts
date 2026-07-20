import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.position.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  create(dto: CreatePositionDto) {
    return this.prisma.position.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreatePositionDto>) {
    const pos = await this.prisma.position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('岗位不存在');
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async disable(id: string) {
    const pos = await this.prisma.position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('岗位不存在');
    return this.prisma.position.update({ where: { id }, data: { status: 'INACTIVE' } });
  }
}
