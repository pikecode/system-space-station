import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomerInvestment,
  InvestmentCommissionConfig,
  InvestmentCommissionReceiverType,
  Prisma,
  ProfitShareConfig,
  ProfitShareReceiverType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestmentProductDto } from './dto/create-investment-product.dto';
import { CreateCustomerInvestmentDto } from './dto/create-customer-investment.dto';
import { CreateProductYieldDto } from './dto/create-product-yield.dto';
import { CreateProfitShareConfigDto } from './dto/create-profit-share-config.dto';
import { CreateInvestmentCommissionConfigDto } from './dto/create-investment-commission-config.dto';

const INVESTMENT_NO_LOCK_KEY = 2_608_182;
const CUSTOMER_NO_LOCK_KEY = 2_608_181;

type Tx = Prisma.TransactionClient;

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  private async generateCustomerNo(tx: Tx): Promise<string> {
    await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(${CUSTOMER_NO_LOCK_KEY})`);
    const prefix = `C${new Date().toISOString().slice(0, 7).replace('-', '')}`;
    const count = await tx.customer.count({
      where: { customerNo: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }

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
      if (customer.status === 'INACTIVE') throw new BadRequestException('客户已停用，不能创建投资记录');
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
      if (contracted && contracted.status !== 'ACTIVE') throw new BadRequestException('签约人已停用');
      if (contracted && !contracted.departmentId) throw new BadRequestException('签约人未分配部门');

      if (!customer.contractedBy && !contracted) {
        throw new BadRequestException('客户尚未维护签约人，请填写签约人编号后再创建投资');
      }

      const shouldActivateCustomer = customer.status !== 'ACTIVE_MEMBER';
      const activatedAt = new Date(dto.investedAt);
      const initialPassword = customer.phone.slice(-6) || '123456';
      const customerNo = customer.customerNo ?? await this.generateCustomerNo(tx);
      const customerPasswordHash = customer.customerPasswordHash
        ?? await bcrypt.hash(initialPassword, 10);
      if (shouldActivateCustomer || !customer.customerNo || !customer.customerPasswordHash || (contracted && !customer.contractedBy)) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            status: 'ACTIVE_MEMBER',
            customerNo,
            customerPasswordHash,
            memberActivatedAt: customer.memberActivatedAt ?? activatedAt,
            ...(contracted && !customer.contractedBy ? {
              contractedBy: contracted.id,
              contractedEmployeeNo: contracted.employeeNo,
              contractedDepartmentId: contracted.departmentId,
              contractedAt: activatedAt,
            } : {}),
          },
        });
      }

      const investmentNo = await this.generateInvestmentNo(tx);
      const investment = await tx.customerInvestment.create({
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
      await this.createInvestmentCommissionRecords(tx, investment);
      if (shouldActivateCustomer) {
        await tx.auditLog.create({
          data: {
            action: 'CUSTOMER_INVESTMENT_ACTIVATE_MEMBER',
            entityType: 'Customer',
            entityId: customer.id,
            operatorId: currentUser.id,
            before: { status: customer.status, customerNo: customer.customerNo },
            after: { status: 'ACTIVE_MEMBER', customerNo },
          },
        });
      }
      return {
        ...investment,
        customerLogin: customer.customerPasswordHash
          ? { customerNo, initialPassword: null }
          : { customerNo, initialPassword },
      };
    });
  }

  findInvestmentCommissionRecords(query: { investmentId?: string; receiverType?: string; status?: string }) {
    const where: Prisma.InvestmentCommissionRecordWhereInput = {};
    if (query.investmentId) where.investmentId = query.investmentId;
    if (query.receiverType) where.receiverType = query.receiverType as any;
    if (query.status) where.status = query.status as any;
    return this.prisma.investmentCommissionRecord.findMany({
      where,
      include: {
        investment: {
          include: {
            customer: { select: { id: true, name: true, customerNo: true } },
            product: { select: { id: true, productNo: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async settleInvestmentCommissionRecord(id: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.investmentCommissionRecord.findUnique({ where: { id } });
      if (!record) throw new NotFoundException('投资本金佣金记录不存在');
      if (record.status !== 'GENERATED') throw new ConflictException('只有已生成状态可以结算');
      const updated = await tx.investmentCommissionRecord.update({
        where: { id },
        data: { status: 'SETTLED', settledAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          action: 'INVESTMENT_COMMISSION_SETTLE',
          entityType: 'InvestmentCommissionRecord',
          entityId: id,
          operatorId,
          after: { status: 'SETTLED' },
        },
      });
      return updated;
    });
  }

  getInvestmentCommissionConfigs() {
    return this.prisma.investmentCommissionConfig.findMany({
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  getCurrentInvestmentCommissionConfig(tx: Tx = this.prisma) {
    return tx.investmentCommissionConfig.findFirst({
      where: { status: 'ACTIVE', effectiveFrom: { lte: new Date() } },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    }).then((config) => {
      if (!config) throw new BadRequestException('请先配置投资本金佣金比例');
      return config;
    });
  }

  async createInvestmentCommissionConfig(dto: CreateInvestmentCommissionConfigDto, operatorId: string) {
    const sum = dto.contractedDepartmentRatio + dto.contractedUserRatio + dto.companyRatio;
    if (sum <= 0) throw new BadRequestException('投资本金佣金比例之和必须大于0');
    if (sum > 100) throw new BadRequestException(`投资本金佣金比例之和不能超过100，当前为${sum}`);
    return this.prisma.investmentCommissionConfig.create({
      data: {
        contractedDepartmentRatio: new Prisma.Decimal(dto.contractedDepartmentRatio),
        contractedUserRatio: new Prisma.Decimal(dto.contractedUserRatio),
        companyRatio: new Prisma.Decimal(dto.companyRatio),
        effectiveFrom: new Date(dto.effectiveFrom),
        remark: dto.remark,
        createdBy: operatorId,
      },
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

  findProfitRecords(query: { customerId?: string; productId?: string; investmentId?: string; status?: string }) {
    const where: Prisma.CustomerProfitRecordWhereInput = {};
    if (query.customerId) where.customerId = query.customerId;
    if (query.productId) where.productId = query.productId;
    if (query.investmentId) where.investmentId = query.investmentId;
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

  async settleYieldPeriod(id: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const yieldPeriod = await tx.productYieldPeriod.findUnique({
        where: { id },
        include: { _count: { select: { profitRecords: true } } },
      });
      if (!yieldPeriod) throw new NotFoundException('产品收益周期不存在');
      if (yieldPeriod.status !== 'CONFIRMED') throw new ConflictException('只有已确认状态的收益周期可以批量结算');
      if (yieldPeriod._count.profitRecords === 0) throw new BadRequestException('该收益周期暂无客户收益记录');

      const generatedCount = await tx.customerProfitRecord.count({
        where: { yieldPeriodId: id, status: 'GENERATED' },
      });
      if (generatedCount === 0) throw new ConflictException('该收益周期没有待结算的客户收益');
      if (generatedCount !== yieldPeriod._count.profitRecords) {
        throw new ConflictException('该收益周期存在部分已结算记录，请先核对客户收益明细');
      }

      const now = new Date();
      await tx.customerProfitRecord.updateMany({
        where: { yieldPeriodId: id, status: 'GENERATED' },
        data: { status: 'SETTLED', settledAt: now },
      });
      await tx.profitShareRecord.updateMany({
        where: { profitRecord: { yieldPeriodId: id }, status: 'GENERATED' },
        data: { status: 'SETTLED', settledAt: now },
      });
      await tx.productYieldPeriod.update({
        where: { id },
        data: { status: 'SETTLED' },
      });
      await tx.auditLog.create({
        data: {
          action: 'PRODUCT_YIELD_SETTLE',
          entityType: 'ProductYieldPeriod',
          entityId: id,
          operatorId,
          after: { status: 'SETTLED', recordCount: generatedCount },
        },
      });
      return tx.productYieldPeriod.findUnique({
        where: { id },
        include: { _count: { select: { profitRecords: true } } },
      });
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

  private toInvestmentCommissionSnapshot(config: InvestmentCommissionConfig) {
    return {
      configId: config.id,
      contractedDepartmentRatio: config.contractedDepartmentRatio.toString(),
      contractedUserRatio: config.contractedUserRatio.toString(),
      companyRatio: config.companyRatio.toString(),
      effectiveFrom: config.effectiveFrom.toISOString(),
    };
  }

  private async createInvestmentCommissionRecords(tx: Tx, investment: CustomerInvestment) {
    const config = await this.getCurrentInvestmentCommissionConfig(tx);
    const snapshot = this.toInvestmentCommissionSnapshot(config);
    const departmentAmount = this.applyRatio(investment.amount, snapshot.contractedDepartmentRatio);
    const contractedUserAmount = this.applyRatio(investment.amount, snapshot.contractedUserRatio);
    const companyAmount = this.applyRatio(investment.amount, snapshot.companyRatio);

    if (departmentAmount.gt(0) && !investment.contractedDepartmentId) {
      throw new BadRequestException('客户投资缺少签约部门，无法生成投资本金佣金');
    }
    if (contractedUserAmount.gt(0) && !investment.contractedBy) {
      throw new BadRequestException('客户投资缺少签约人，无法生成投资本金佣金');
    }

    await tx.investmentCommissionRecord.createMany({
      data: [
        {
          investmentId: investment.id,
          receiverType: InvestmentCommissionReceiverType.CONTRACTED_DEPARTMENT,
          receiverId: investment.contractedDepartmentId,
          receiverNo: investment.contractedDepartmentId,
          baseAmount: investment.amount,
          ratio: new Prisma.Decimal(snapshot.contractedDepartmentRatio),
          amount: departmentAmount,
          configSnapshot: snapshot,
        },
        {
          investmentId: investment.id,
          receiverType: InvestmentCommissionReceiverType.CONTRACTED_USER,
          receiverId: investment.contractedBy,
          receiverNo: investment.contractedEmployeeNo,
          baseAmount: investment.amount,
          ratio: new Prisma.Decimal(snapshot.contractedUserRatio),
          amount: contractedUserAmount,
          configSnapshot: snapshot,
        },
        {
          investmentId: investment.id,
          receiverType: InvestmentCommissionReceiverType.COMPANY,
          receiverId: 'COMPANY',
          receiverNo: 'COMPANY',
          baseAmount: investment.amount,
          ratio: new Prisma.Decimal(snapshot.companyRatio),
          amount: companyAmount,
          configSnapshot: snapshot,
        },
      ],
    });
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
