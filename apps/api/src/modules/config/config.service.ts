import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  getCurrent() {
    return this.prisma.commissionConfig.findFirst({
      where: { effectiveFrom: { lte: new Date() } },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  getVersions() {
    return this.prisma.commissionConfig.findMany({
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(dto: CreateConfigDto, operatorId: string) {
    const sum = dto.memberRatio + dto.deptHeadRatio + dto.marketHeadRatio + dto.companyRatio;
    if (Math.abs(sum - 100) > 0.001) {
      throw new BadRequestException(`四项比例之和必须等于100，当前为${sum}`);
    }
    return this.prisma.commissionConfig.create({
      data: {
        memberRatio: new Prisma.Decimal(dto.memberRatio),
        deptHeadRatio: new Prisma.Decimal(dto.deptHeadRatio),
        marketHeadRatio: new Prisma.Decimal(dto.marketHeadRatio),
        companyRatio: new Prisma.Decimal(dto.companyRatio),
        settlementDays: dto.settlementDays,
        effectiveFrom: new Date(dto.effectiveFrom),
        remark: dto.remark,
        createdBy: operatorId,
      },
    });
  }
}
