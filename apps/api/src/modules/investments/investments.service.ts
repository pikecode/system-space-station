import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomerInvestment,
  Prisma,
  ProfitShareConfig,
  ProfitShareReceiverType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestmentProductDto } from './dto/create-investment-product.dto';
import { CreateCustomerInvestmentDto } from './dto/create-customer-investment.dto';
import { CreateProductYieldDto } from './dto/create-product-yield.dto';
import { CreateProfitShareConfigDto } from './dto/create-profit-share-config.dto';

const INVESTMENT_NO_LOCK_KEY = 2_608_182;

type Tx = Prisma.TransactionClient;

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  findProducts(query: { status?: string }) {
    return this.prisma.investmentProduct.findMany({
      where: query.status ? { status: query.status as any } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  createProduct(dto: CreateInvestmentProductDto, operatorId: string) {
    return this.prisma.investmentProduct.create({
      data: {
        productNo: dto.productNo.trim().toUpperCase(),
        name: dto.name.trim(),
        productType: dto.productType,
        riskLevel: dto.riskLevel,
        minAmount: dto.minAmount === undefined ? undefined : new Prisma.Decimal(dto.minAmount),
        expectedStartAt: dto.expectedStartAt ? new Date(dto.expectedStartAt) : undefined,
        expectedEndAt: dto.expectedEndAt ? new Date(dto.expectedEndAt) : undefined,
        status: dto.status ?? 'DRAFT',
        remark: dto.remark,
        createdBy: operatorId,
      },
    });
  }

  findCustomerInvestments(query: { customerId?: string; productId?: string; status?: string }) {
    const where: Prisma.CustomerInvestmentWhereInput = {};
    if (query.customerId) where.customerId = query.customerId;
    if (query.productId) where.productId = query.productId;
    if (query.status) where.status = query.status as any;
    return this.prisma.customerInvestment.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, customerNo: true, status: true } },
        product: { select: { id: true, productNo: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCustomerInvestment(dto: CreateCustomerInvestmentDto, currentUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const [customer, product, operator] = await Promise.all([
        tx.customer.findUnique({ where: { id: dto.customerId } }),
        tx.investmentProduct.findUnique({ where: { id: dto.productId } }),
        tx.user.findUnique({
          where: { id: currentUser.id },
          select: { id: true, employeeNo: true, departmentId: true },
        }),
      ]);
      if (!customer) throw new NotFoundException('客户不存在');
      if (customer.status !== 'ACTIVE_MEMBER') throw new BadRequestException('只有正式会员可以创建投资记录');
      if (!product) throw new NotFoundException('产品不存在');
      if (product.status !== 'ACTIVE') throw new BadRequestException('只有启用产品可以创建投资记录');
      const amount = new Prisma.Decimal(dto.amount);
      if (product.minAmount && amount.lessThan(product.minAmount)) {
        throw new BadRequestException(`投资金额不能低于产品起投金额 ${product.minAmount.toString()}`);
      }

      const contracted = dto.contractedEmployeeNo
        ? await tx.user.findUnique({
          where: { employeeNo: dto.contractedEmployeeNo.trim().toUpperCase() },
          select: { id: true, employeeNo: true, departmentId: true, status: true },
        })
        : null;
      if (dto.contractedEmployeeNo && !contracted) throw new NotFoundException('签约人不存在');
      if (contracted?.status !== 'ACTIVE') throw new BadRequestException('签约人已停用');
      if (contracted && !contracted.departmentId) throw new BadRequestException('签约人未分配部门');

      const investmentNo = await this.generateInvestmentNo(tx);
      return tx.customerInvestment.create({
        data: {
          investmentNo,
          customerId: customer.id,
          productId: product.id,
          amount,
          investedAt: new Date(dto.investedAt),
          contractedBy: contracted?.id ?? customer.contractedBy,
          contractedEmployeeNo: contracted?.employeeNo ?? customer.contractedEmployeeNo,
          contractedDepartmentId: contracted?.departmentId ?? customer.contractedDepartmentId,
          createdBy: currentUser.id,
          createdEmployeeNo: operator?.employeeNo,
          createdDepartmentId: operator?.departmentId,
          remark: dto.remark,
        },
      });
    });
  }

  findYieldPeriods(query: { productId?: string; status?: string }) {
    const where: Prisma.ProductYieldPeriodWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.status) where.status = query.status as any;
    return this.prisma.productYieldPeriod.findMany({
      where,
      include: {
        product: { select: { id: true, productNo: true, name: true } },
        _count: { select: { profitRecords: true } },
      },
      orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
    });
  }

  createYieldPeriod(dto: CreateProductYieldDto, operatorId: string) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    if (periodEnd < periodStart) throw new BadRequestException('周期结束日期不能早于开始日期');
    return this.prisma.productYieldPeriod.create({
      data: {
        productId: dto.productId,
        periodStart,
        periodEnd,
        totalProfit: new Prisma.Decimal(dto.totalProfit),
        remark: dto.remark,
        createdBy: operatorId,
      },
    });
  }

  async confirmYieldPeriod(id: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const yieldPeriod = await tx.productYieldPeriod.findUnique({
        where: { id },
        include: { product: true },
      });
      if (!yieldPeriod) throw new NotFoundException('产品收益周期不存在');
      if (yieldPeriod.status !== 'DRAFT') throw new ConflictException('只有草稿状态的收益周期可以确认');

      const existing = await tx.customerProfitRecord.count({ where: { yieldPeriodId: id } });
      if (existing > 0) throw new ConflictException('该收益周期已生成客户收益，不能重复确认');

      const investments = await tx.customerInvestment.findMany({
        where: { productId: yieldPeriod.productId, status: 'ACTIVE' },
        include: { customer: true },
      });
      if (!investments.length) throw new BadRequestException('该产品暂无有效投资，无法生成收益');

      const totalPrincipal = investments.reduce(
        (sum, item) => sum.plus(item.amount),
        new Prisma.Decimal(0),
      );
      if (totalPrincipal.lte(0)) throw new BadRequestException('有效投资本金必须大于 0');

      const config = await this.getCurrentProfitShareConfig(tx);
      const ratioSnapshot = this.toRatioSnapshot(config);

      for (const investment of investments) {
        const shareRatio = investment.amount.div(totalPrincipal).toDecimalPlaces(8);
        const grossProfit = yieldPeriod.totalProfit.mul(shareRatio).toDecimalPlaces(2);
        const shareAmounts = this.calculateShareAmounts(grossProfit, ratioSnapshot);
        const profitRecord = await tx.customerProfitRecord.create({
          data: {
            customerId: investment.customerId,
            investmentId: investment.id,
            productId: investment.productId,
            yieldPeriodId: yieldPeriod.id,
            principalAmount: investment.amount,
            investmentShareRatio: shareRatio,
            profitAmount: grossProfit,
            customerAmount: shareAmounts.CUSTOMER,
            ratioSnapshot,
          },
        });
        await tx.profitShareRecord.createMany({
          data: this.buildShareRecords(profitRecord.id, investment, shareAmounts, ratioSnapshot),
        });
      }

      await tx.productYieldPeriod.update({
        where: { id },
        data: { status: 'CONFIRMED', confirmedBy: operatorId, confirmedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_YIELD_CONFIRM',
          entityType: 'ProductYieldPeriod',
          entityId: id,
          operatorId,
          after: {
            productId: yieldPeriod.productId,
            totalProfit: yieldPeriod.totalProfit.toString(),
            investmentCount: investments.length,
          },
        },
      });

      return tx.productYieldPeriod.findUnique({
        where: { id },
        include: { _count: { select: { profitRecords: true } } },
      });
    });
  }

  findProfitRecords(query: { customerId?: string; productId?: string; status?: string }) {
    const where: Prisma.CustomerProfitRecordWhereInput = {};
    if (query.customerId) where.customerId = query.customerId;
    if (query.productId) where.productId = query.productId;
    if (query.status) where.status = query.status as any;
    return this.prisma.customerProfitRecord.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, customerNo: true } },
        product: { select: { id: true, productNo: true, name: true } },
        yieldPeriod: { select: { id: true, periodStart: true, periodEnd: true, totalProfit: true } },
        shareRecords: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async settleProfitRecord(id: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.customerProfitRecord.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('客户收益记录不存在');
      if (record.status !== 'GENERATED') throw new ConflictException('只有已生成状态可以手动结算');
      const now = new Date();
      await tx.customerProfitRecord.update({
        where: { id },
        data: { status: 'SETTLED', settledAt: now },
      });
      await tx.profitShareRecord.updateMany({
        where: { profitRecordId: id },
        data: { status: 'SETTLED', settledAt: now },
      });
      await tx.auditLog.create({
        data: {
          action: 'CUSTOMER_PROFIT_SETTLE',
          entityType: 'CustomerProfitRecord',
          entityId: id,
          operatorId,
          after: { status: 'SETTLED' },
        },
      });
      return tx.customerProfitRecord.findUnique({ where: { id }, include: { shareRecords: true } });
    });
  }

  getProfitShareConfigs() {
    return this.prisma.profitShareConfig.findMany({
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  getCurrentProfitShareConfig(tx: Tx = this.prisma) {
    return tx.profitShareConfig.findFirst({
      where: { status: 'ACTIVE', effectiveFrom: { lte: new Date() } },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    }).then((config) => {
      if (!config) throw new BadRequestException('请先配置投资收益分配比例');
      return config;
    });
  }

  async createProfitShareConfig(dto: CreateProfitShareConfigDto, operatorId: string) {
    const sum = dto.customerRatio + dto.departmentRatio + dto.contractedUserRatio + dto.createdUserRatio + dto.companyRatio;
    if (Math.abs(sum - 100) > 0.001) {
      throw new BadRequestException(`五项比例之和必须等于100，当前为${sum}`);
    }
    return this.prisma.profitShareConfig.create({
      data: {
        customerRatio: new Prisma.Decimal(dto.customerRatio),
        departmentRatio: new Prisma.Decimal(dto.departmentRatio),
        contractedUserRatio: new Prisma.Decimal(dto.contractedUserRatio),
        createdUserRatio: new Prisma.Decimal(dto.createdUserRatio),
        companyRatio: new Prisma.Decimal(dto.companyRatio),
        effectiveFrom: new Date(dto.effectiveFrom),
        remark: dto.remark,
        createdBy: operatorId,
      },
    });
  }

  private async generateInvestmentNo(tx: Tx): Promise<string> {
    await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(${INVESTMENT_NO_LOCK_KEY})`);
    const prefix = `I${new Date().toISOString().slice(0, 7).replace('-', '')}`;
    const count = await tx.customerInvestment.count({ where: { investmentNo: { startsWith: prefix } } });
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

  private toRatioSnapshot(config: ProfitShareConfig) {
    return {
      configId: config.id,
      customerRatio: config.customerRatio.toString(),
      departmentRatio: config.departmentRatio.toString(),
      contractedUserRatio: config.contractedUserRatio.toString(),
      createdUserRatio: config.createdUserRatio.toString(),
      companyRatio: config.companyRatio.toString(),
      effectiveFrom: config.effectiveFrom.toISOString(),
    };
  }

  private calculateShareAmounts(grossProfit: Prisma.Decimal, ratioSnapshot: ReturnType<InvestmentsService['toRatioSnapshot']>) {
    const customer = this.applyRatio(grossProfit, ratioSnapshot.customerRatio);
    const department = this.applyRatio(grossProfit, ratioSnapshot.departmentRatio);
    const contractedUser = this.applyRatio(grossProfit, ratioSnapshot.contractedUserRatio);
    const createdUser = this.applyRatio(grossProfit, ratioSnapshot.createdUserRatio);
    const company = grossProfit.minus(customer).minus(department).minus(contractedUser).minus(createdUser).toDecimalPlaces(2);
    return {
      CUSTOMER: customer,
      DEPARTMENT: department,
      CONTRACTED_USER: contractedUser,
      CREATED_USER: createdUser,
      COMPANY: company,
    };
  }

  private applyRatio(amount: Prisma.Decimal, ratio: string) {
    return amount.mul(new Prisma.Decimal(ratio)).div(100).toDecimalPlaces(2);
  }

  private buildShareRecords(
    profitRecordId: string,
    investment: CustomerInvestment & { customer: { customerNo: string | null } },
    amounts: ReturnType<InvestmentsService['calculateShareAmounts']>,
    ratioSnapshot: ReturnType<InvestmentsService['toRatioSnapshot']>,
  ): Prisma.ProfitShareRecordCreateManyInput[] {
    return [
      {
        profitRecordId,
        receiverType: ProfitShareReceiverType.CUSTOMER,
        receiverId: investment.customerId,
        receiverNo: investment.customer.customerNo,
        ratio: new Prisma.Decimal(ratioSnapshot.customerRatio),
        amount: amounts.CUSTOMER,
      },
      {
        profitRecordId,
        receiverType: ProfitShareReceiverType.DEPARTMENT,
        receiverId: investment.contractedDepartmentId,
        receiverNo: investment.contractedDepartmentId,
        ratio: new Prisma.Decimal(ratioSnapshot.departmentRatio),
        amount: amounts.DEPARTMENT,
      },
      {
        profitRecordId,
        receiverType: ProfitShareReceiverType.CONTRACTED_USER,
        receiverId: investment.contractedBy,
        receiverNo: investment.contractedEmployeeNo,
        ratio: new Prisma.Decimal(ratioSnapshot.contractedUserRatio),
        amount: amounts.CONTRACTED_USER,
      },
      {
        profitRecordId,
        receiverType: ProfitShareReceiverType.CREATED_USER,
        receiverId: investment.createdBy,
        receiverNo: investment.createdEmployeeNo,
        ratio: new Prisma.Decimal(ratioSnapshot.createdUserRatio),
        amount: amounts.CREATED_USER,
      },
      {
        profitRecordId,
        receiverType: ProfitShareReceiverType.COMPANY,
        receiverId: 'COMPANY',
        receiverNo: 'COMPANY',
        ratio: new Prisma.Decimal(ratioSnapshot.companyRatio),
        amount: amounts.COMPANY,
      },
    ];
  }
}
