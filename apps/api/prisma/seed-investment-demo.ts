import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedUser = {
  id: string;
  employeeNo: string | null;
  departmentId: string;
};

type SeedInvestment = {
  id: string;
  investmentNo: string;
  customerId: string;
  customerNo: string;
  productId: string;
  amount: Prisma.Decimal;
  contractedBy: string;
  contractedEmployeeNo: string;
  contractedDepartmentId: string;
  createdBy: string;
  createdEmployeeNo: string;
  createdDepartmentId: string;
};

type ProfitRatioSnapshot = {
  configId: string;
  customerRatio: string;
  departmentRatio: string;
  contractedUserRatio: string;
  createdUserRatio: string;
  companyRatio: string;
  effectiveFrom: string;
};

const decimal = (value: number | string) => new Prisma.Decimal(value);

async function requireUser(employeeNo: string): Promise<SeedUser> {
  const user = await prisma.user.findUnique({
    where: { employeeNo },
    select: { id: true, employeeNo: true, departmentId: true },
  });
  if (!user?.departmentId) throw new Error(`缺少测试员工或部门：${employeeNo}，请先执行 pnpm --filter api prisma:seed`);
  return { id: user.id, employeeNo: user.employeeNo, departmentId: user.departmentId };
}

function applyRatio(amount: Prisma.Decimal, ratio: string | number) {
  return amount.mul(decimal(ratio)).div(100).toDecimalPlaces(2);
}

async function upsertDemoCustomer(input: {
  id: string;
  customerNo: string;
  name: string;
  phone: string;
  customerType: 'INDIVIDUAL' | 'COMPANY';
  source: 'REFERRAL' | 'SELF_DEVELOPED' | 'ACTIVITY' | 'ONLINE';
  assigned: SeedUser;
  contracted: SeedUser;
  createdBy: SeedUser;
  tags: string;
  notes: string;
  industry?: string;
  contactName?: string;
  creditCode?: string;
}) {
  const passwordHash = await bcrypt.hash('Corp123456', 10);
  await prisma.customer.upsert({
    where: { id: input.id },
    update: {
      name: input.name,
      phone: input.phone,
      customerType: input.customerType,
      source: input.source,
      tags: input.tags,
      notes: input.notes,
      customerNo: input.customerNo,
      customerPasswordHash: passwordHash,
      memberActivatedAt: new Date('2026-08-18T09:00:00.000Z'),
      assignedTo: input.assigned.id,
      departmentId: input.assigned.departmentId,
      createdBy: input.createdBy.id,
      contractedBy: input.contracted.id,
      contractedEmployeeNo: input.contracted.employeeNo,
      contractedDepartmentId: input.contracted.departmentId,
      contractedAt: new Date('2026-08-18T09:00:00.000Z'),
      registrationSource: 'ADMIN',
      status: 'ACTIVE_MEMBER',
      industry: input.industry,
      contactName: input.contactName,
      creditCode: input.creditCode,
    },
    create: {
      id: input.id,
      name: input.name,
      phone: input.phone,
      customerType: input.customerType,
      source: input.source,
      tags: input.tags,
      notes: input.notes,
      customerNo: input.customerNo,
      customerPasswordHash: passwordHash,
      memberActivatedAt: new Date('2026-08-18T09:00:00.000Z'),
      assignedTo: input.assigned.id,
      departmentId: input.assigned.departmentId,
      createdBy: input.createdBy.id,
      contractedBy: input.contracted.id,
      contractedEmployeeNo: input.contracted.employeeNo,
      contractedDepartmentId: input.contracted.departmentId,
      contractedAt: new Date('2026-08-18T09:00:00.000Z'),
      registrationSource: 'ADMIN',
      status: 'ACTIVE_MEMBER',
      industry: input.industry,
      contactName: input.contactName,
      creditCode: input.creditCode,
    },
  });
}

async function upsertDemoMembership(input: {
  id: string;
  memberNo: string;
  customerId: string;
  memberLevelId: string;
  fee: number;
  submittedBy: SeedUser;
  reviewedBy: SeedUser;
}) {
  await prisma.membership.upsert({
    where: { id: input.id },
    update: {
      status: 'PAID',
      memberLevelId: input.memberLevelId,
      fee: input.fee,
      paidAmount: input.fee,
      paidAt: new Date('2026-08-18T10:00:00.000Z'),
      paymentConfirmedBy: input.reviewedBy.id,
      reviewedBy: input.reviewedBy.id,
      reviewedAt: new Date('2026-08-18T09:30:00.000Z'),
    },
    create: {
      id: input.id,
      memberNo: input.memberNo,
      customerId: input.customerId,
      memberLevelId: input.memberLevelId,
      fee: input.fee,
      startDate: new Date('2026-08-18'),
      endDate: new Date('2027-08-18'),
      status: 'PAID',
      submittedBy: input.submittedBy.id,
      submittedDepartmentId: input.submittedBy.departmentId,
      submittedAssignedTo: input.submittedBy.id,
      reviewedBy: input.reviewedBy.id,
      reviewedAt: new Date('2026-08-18T09:30:00.000Z'),
      approvedDepartmentId: input.submittedBy.departmentId,
      approvedAssignedTo: input.submittedBy.id,
      paidAmount: input.fee,
      paidAt: new Date('2026-08-18T10:00:00.000Z'),
      paymentConfirmedBy: input.reviewedBy.id,
    },
  });
}

async function upsertInvestment(input: SeedInvestment & {
  investedAt: Date;
  remark: string;
}) {
  return prisma.customerInvestment.upsert({
    where: { id: input.id },
    update: {
      investmentNo: input.investmentNo,
      customerId: input.customerId,
      productId: input.productId,
      amount: input.amount,
      investedAt: input.investedAt,
      status: 'ACTIVE',
      contractedBy: input.contractedBy,
      contractedEmployeeNo: input.contractedEmployeeNo,
      contractedDepartmentId: input.contractedDepartmentId,
      createdBy: input.createdBy,
      createdEmployeeNo: input.createdEmployeeNo,
      createdDepartmentId: input.createdDepartmentId,
      remark: input.remark,
    },
    create: {
      id: input.id,
      investmentNo: input.investmentNo,
      customerId: input.customerId,
      productId: input.productId,
      amount: input.amount,
      investedAt: input.investedAt,
      status: 'ACTIVE',
      contractedBy: input.contractedBy,
      contractedEmployeeNo: input.contractedEmployeeNo,
      contractedDepartmentId: input.contractedDepartmentId,
      createdBy: input.createdBy,
      createdEmployeeNo: input.createdEmployeeNo,
      createdDepartmentId: input.createdDepartmentId,
      remark: input.remark,
    },
  });
}

async function resetInvestmentCommissions(investment: SeedInvestment, settled: boolean) {
  await prisma.investmentCommissionRecord.deleteMany({ where: { investmentId: investment.id } });
  const snapshot = {
    configId: 'demo-investment-commission-202608',
    contractedDepartmentRatio: '1',
    contractedUserRatio: '2',
    companyRatio: '0.5',
    effectiveFrom: new Date('2026-08-01').toISOString(),
  };
  const status = settled ? 'SETTLED' : 'GENERATED';
  const settledAt = settled ? new Date('2026-08-31T17:00:00.000Z') : null;
  await prisma.investmentCommissionRecord.createMany({
    data: [
      {
        investmentId: investment.id,
        receiverType: 'CONTRACTED_DEPARTMENT',
        receiverId: investment.contractedDepartmentId,
        receiverNo: investment.contractedDepartmentId,
        baseAmount: investment.amount,
        ratio: 1,
        amount: applyRatio(investment.amount, 1),
        configSnapshot: snapshot,
        status,
        settledAt,
      },
      {
        investmentId: investment.id,
        receiverType: 'CONTRACTED_USER',
        receiverId: investment.contractedBy,
        receiverNo: investment.contractedEmployeeNo,
        baseAmount: investment.amount,
        ratio: 2,
        amount: applyRatio(investment.amount, 2),
        configSnapshot: snapshot,
        status,
        settledAt,
      },
      {
        investmentId: investment.id,
        receiverType: 'COMPANY',
        receiverId: 'COMPANY',
        receiverNo: 'COMPANY',
        baseAmount: investment.amount,
        ratio: 0.5,
        amount: applyRatio(investment.amount, 0.5),
        configSnapshot: snapshot,
        status,
        settledAt,
      },
    ],
  });
}

async function resetYieldProfits(input: {
  id: string;
  productId: string;
  productInvestmentIds: string[];
  periodStart: Date;
  periodEnd: Date;
  totalProfit: Prisma.Decimal;
  status: 'CONFIRMED' | 'SETTLED';
  createdBy: string;
  ratioSnapshot: ProfitRatioSnapshot;
  investmentsById: Map<string, SeedInvestment>;
}) {
  await prisma.profitShareRecord.deleteMany({
    where: { profitRecord: { yieldPeriodId: input.id } },
  });
  await prisma.customerProfitRecord.deleteMany({ where: { yieldPeriodId: input.id } });

  await prisma.productYieldPeriod.upsert({
    where: {
      productId_periodStart_periodEnd: {
        productId: input.productId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      },
    },
    update: {
      totalProfit: input.totalProfit,
      status: input.status,
      confirmedBy: input.createdBy,
      confirmedAt: new Date(input.periodEnd.getTime() + 9 * 60 * 60 * 1000),
      remark: input.status === 'SETTLED' ? '演示数据：历史已结算收益周期' : '演示数据：当前待结算收益周期',
    },
    create: {
      id: input.id,
      productId: input.productId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalProfit: input.totalProfit,
      status: input.status,
      confirmedBy: input.createdBy,
      confirmedAt: new Date(input.periodEnd.getTime() + 9 * 60 * 60 * 1000),
      remark: input.status === 'SETTLED' ? '演示数据：历史已结算收益周期' : '演示数据：当前待结算收益周期',
      createdBy: input.createdBy,
    },
  });

  const investments = input.productInvestmentIds.map((id) => input.investmentsById.get(id)).filter(Boolean) as SeedInvestment[];
  const totalPrincipal = investments.reduce((sum, item) => sum.plus(item.amount), decimal(0));
  const recordStatus = input.status === 'SETTLED' ? 'SETTLED' : 'GENERATED';
  const settledAt = input.status === 'SETTLED' ? new Date(input.periodEnd.getTime() + 17 * 60 * 60 * 1000) : null;

  for (const investment of investments) {
    const shareRatio = investment.amount.div(totalPrincipal).toDecimalPlaces(8);
    const grossProfit = input.totalProfit.mul(shareRatio).toDecimalPlaces(2);
    const customerAmount = applyRatio(grossProfit, input.ratioSnapshot.customerRatio);
    const departmentAmount = applyRatio(grossProfit, input.ratioSnapshot.departmentRatio);
    const contractedAmount = applyRatio(grossProfit, input.ratioSnapshot.contractedUserRatio);
    const createdAmount = applyRatio(grossProfit, input.ratioSnapshot.createdUserRatio);
    const companyAmount = grossProfit.minus(customerAmount).minus(departmentAmount).minus(contractedAmount).minus(createdAmount).toDecimalPlaces(2);
    const profitRecord = await prisma.customerProfitRecord.create({
      data: {
        id: `demo-profit-${investment.id}-${input.periodStart.toISOString().slice(0, 7)}`,
        customerId: investment.customerId,
        investmentId: investment.id,
        productId: investment.productId,
        yieldPeriodId: input.id,
        principalAmount: investment.amount,
        investmentShareRatio: shareRatio,
        profitAmount: grossProfit,
        customerAmount,
        ratioSnapshot: input.ratioSnapshot,
        status: recordStatus,
        settledAt,
      },
    });
    await prisma.profitShareRecord.createMany({
      data: [
        { profitRecordId: profitRecord.id, receiverType: 'CUSTOMER', receiverId: investment.customerId, receiverNo: investment.customerNo, ratio: decimal(input.ratioSnapshot.customerRatio), amount: customerAmount, status: recordStatus, settledAt },
        { profitRecordId: profitRecord.id, receiverType: 'DEPARTMENT', receiverId: investment.contractedDepartmentId, receiverNo: investment.contractedDepartmentId, ratio: decimal(input.ratioSnapshot.departmentRatio), amount: departmentAmount, status: recordStatus, settledAt },
        { profitRecordId: profitRecord.id, receiverType: 'CONTRACTED_USER', receiverId: investment.contractedBy, receiverNo: investment.contractedEmployeeNo, ratio: decimal(input.ratioSnapshot.contractedUserRatio), amount: contractedAmount, status: recordStatus, settledAt },
        { profitRecordId: profitRecord.id, receiverType: 'CREATED_USER', receiverId: investment.createdBy, receiverNo: investment.createdEmployeeNo, ratio: decimal(input.ratioSnapshot.createdUserRatio), amount: createdAmount, status: recordStatus, settledAt },
        { profitRecordId: profitRecord.id, receiverType: 'COMPANY', receiverId: 'COMPANY', receiverNo: 'COMPANY', ratio: decimal(input.ratioSnapshot.companyRatio), amount: companyAmount, status: recordStatus, settledAt },
      ],
    });
  }
}

async function main() {
  console.log('开始初始化投资业务演示数据...');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  if (!admin) throw new Error('缺少管理员账号，请先执行基础 seed');

  const marketHead = await requireUser('MKT0201');
  const marketTwoHead = await requireUser('MKT0301');
  const divisionMember = await requireUser('DIV020102');
  const divisionTwoHead = await requireUser('DIV020201');
  const marketTwoPartner = await requireUser('DIV030106');

  await prisma.investmentCommissionConfig.upsert({
    where: { id: 'demo-investment-commission-202608' },
    update: {
      contractedDepartmentRatio: 1,
      contractedUserRatio: 2,
      companyRatio: 0.5,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '演示：投资本金抽佣，合计3.5%',
    },
    create: {
      id: 'demo-investment-commission-202608',
      contractedDepartmentRatio: 1,
      contractedUserRatio: 2,
      companyRatio: 0.5,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '演示：投资本金抽佣，合计3.5%',
      createdBy: admin.id,
    },
  });

  await prisma.profitShareConfig.upsert({
    where: { id: 'demo-profit-share-202608' },
    update: {
      customerRatio: 62,
      departmentRatio: 12,
      contractedUserRatio: 8,
      createdUserRatio: 8,
      companyRatio: 10,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '演示：投资收益分配，客户62%，签约部门12%，签约人8%，录入人8%，公司10%',
    },
    create: {
      id: 'demo-profit-share-202608',
      customerRatio: 62,
      departmentRatio: 12,
      contractedUserRatio: 8,
      createdUserRatio: 8,
      companyRatio: 10,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '演示：投资收益分配，客户62%，签约部门12%，签约人8%，录入人8%，公司10%',
      createdBy: admin.id,
    },
  });

  await upsertDemoCustomer({
    id: 'demo-customer-bay-manufacturing',
    customerNo: 'C202608990001',
    name: '大湾区智造有限公司',
    phone: '18620003001',
    customerType: 'COMPANY',
    source: 'REFERRAL',
    assigned: divisionMember,
    contracted: marketHead,
    createdBy: divisionMember,
    tags: '投资演示,制造业,正式会员',
    notes: '用于查看单客户多产品投资、本金佣金、收益分配链路。',
    industry: '智能制造',
    contactName: '梁总',
    creditCode: '91440101DEMO0001X',
  });
  await upsertDemoCustomer({
    id: 'demo-customer-health-tech',
    customerNo: 'C202608990002',
    name: '华南医疗科技有限公司',
    phone: '18620003002',
    customerType: 'COMPANY',
    source: 'SELF_DEVELOPED',
    assigned: divisionTwoHead,
    contracted: marketHead,
    createdBy: divisionTwoHead,
    tags: '投资演示,医疗科技,正式会员',
    notes: '用于查看不同投资金额下的佣金和收益分配差异。',
    industry: '医疗科技',
    contactName: '唐总',
    creditCode: '91440101DEMO0002X',
  });
  await upsertDemoCustomer({
    id: 'demo-customer-ms-lin',
    customerNo: 'C202608990003',
    name: '林女士',
    phone: '18620003003',
    customerType: 'INDIVIDUAL',
    source: 'ACTIVITY',
    assigned: marketTwoPartner,
    contracted: marketTwoHead,
    createdBy: marketTwoPartner,
    tags: '投资演示,个人投资者,正式会员',
    notes: '用于查看跨市场签约人和签约部门分配。',
  });

  await upsertDemoMembership({ id: 'demo-membership-bay-manufacturing', memberNo: 'M202608990001', customerId: 'demo-customer-bay-manufacturing', memberLevelId: 'level-gold', fee: 20000, submittedBy: divisionMember, reviewedBy: marketHead });
  await upsertDemoMembership({ id: 'demo-membership-health-tech', memberNo: 'M202608990002', customerId: 'demo-customer-health-tech', memberLevelId: 'level-silver', fee: 12000, submittedBy: divisionTwoHead, reviewedBy: marketHead });
  await upsertDemoMembership({ id: 'demo-membership-ms-lin', memberNo: 'M202608990003', customerId: 'demo-customer-ms-lin', memberLevelId: 'level-basic', fee: 5000, submittedBy: marketTwoPartner, reviewedBy: marketTwoHead });

  await prisma.investmentProduct.upsert({
    where: { id: 'demo-product-industry-upgrade-2' },
    update: { productNo: 'P202608002', name: '产业升级二号', productType: '股权收益', riskLevel: 'AGGRESSIVE', minAmount: 500000, expectedStartAt: new Date('2026-08-20'), expectedEndAt: new Date('2027-08-19'), status: 'ACTIVE', remark: '演示：多客户共同投资并按占比分收益' },
    create: { id: 'demo-product-industry-upgrade-2', productNo: 'P202608002', name: '产业升级二号', productType: '股权收益', riskLevel: 'AGGRESSIVE', minAmount: 500000, expectedStartAt: new Date('2026-08-20'), expectedEndAt: new Date('2027-08-19'), status: 'ACTIVE', remark: '演示：多客户共同投资并按占比分收益', createdBy: admin.id },
  });
  await prisma.investmentProduct.upsert({
    where: { id: 'demo-product-short-debt-cash' },
    update: { productNo: 'P202608003', name: '短债现金管理', productType: '现金管理', riskLevel: 'CONSERVATIVE', minAmount: 50000, expectedStartAt: new Date('2026-08-25'), expectedEndAt: new Date('2026-11-24'), status: 'ACTIVE', remark: '演示：低风险短周期产品' },
    create: { id: 'demo-product-short-debt-cash', productNo: 'P202608003', name: '短债现金管理', productType: '现金管理', riskLevel: 'CONSERVATIVE', minAmount: 50000, expectedStartAt: new Date('2026-08-25'), expectedEndAt: new Date('2026-11-24'), status: 'ACTIVE', remark: '演示：低风险短周期产品', createdBy: admin.id },
  });
  await prisma.investmentProduct.upsert({
    where: { id: 'demo-product-closed-project' },
    update: { productNo: 'P202608004', name: '历史封闭项目', productType: '项目收益', riskLevel: 'MODERATE', minAmount: 200000, status: 'CLOSED', remark: '演示：已关闭产品，不用于新增投资' },
    create: { id: 'demo-product-closed-project', productNo: 'P202608004', name: '历史封闭项目', productType: '项目收益', riskLevel: 'MODERATE', minAmount: 200000, status: 'CLOSED', remark: '演示：已关闭产品，不用于新增投资', createdBy: admin.id },
  });
  await prisma.investmentProduct.upsert({
    where: { id: 'demo-product-draft' },
    update: { productNo: 'P202608005', name: '储备产品-新能源并购', productType: '并购基金', riskLevel: 'SPECULATIVE', minAmount: 1000000, status: 'DRAFT', remark: '演示：草稿产品，不用于新增投资' },
    create: { id: 'demo-product-draft', productNo: 'P202608005', name: '储备产品-新能源并购', productType: '并购基金', riskLevel: 'SPECULATIVE', minAmount: 1000000, status: 'DRAFT', remark: '演示：草稿产品，不用于新增投资', createdBy: admin.id },
  });

  const investments: SeedInvestment[] = [
    {
      id: 'demo-investment-bay-industry',
      investmentNo: 'I202608990001',
      customerId: 'demo-customer-bay-manufacturing',
      customerNo: 'C202608990001',
      productId: 'demo-product-industry-upgrade-2',
      amount: decimal(2_000_000),
      contractedBy: marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: marketHead.departmentId,
      createdBy: divisionMember.id,
      createdEmployeeNo: 'DIV020102',
      createdDepartmentId: divisionMember.departmentId,
    },
    {
      id: 'demo-investment-health-industry',
      investmentNo: 'I202608990002',
      customerId: 'demo-customer-health-tech',
      customerNo: 'C202608990002',
      productId: 'demo-product-industry-upgrade-2',
      amount: decimal(1_000_000),
      contractedBy: marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: marketHead.departmentId,
      createdBy: divisionTwoHead.id,
      createdEmployeeNo: 'DIV020201',
      createdDepartmentId: divisionTwoHead.departmentId,
    },
    {
      id: 'demo-investment-lin-industry',
      investmentNo: 'I202608990003',
      customerId: 'demo-customer-ms-lin',
      customerNo: 'C202608990003',
      productId: 'demo-product-industry-upgrade-2',
      amount: decimal(500_000),
      contractedBy: marketTwoHead.id,
      contractedEmployeeNo: 'MKT0301',
      contractedDepartmentId: marketTwoHead.departmentId,
      createdBy: marketTwoPartner.id,
      createdEmployeeNo: 'DIV030106',
      createdDepartmentId: marketTwoPartner.departmentId,
    },
    {
      id: 'demo-investment-bay-short-debt',
      investmentNo: 'I202608990004',
      customerId: 'demo-customer-bay-manufacturing',
      customerNo: 'C202608990001',
      productId: 'demo-product-short-debt-cash',
      amount: decimal(300_000),
      contractedBy: marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: marketHead.departmentId,
      createdBy: divisionMember.id,
      createdEmployeeNo: 'DIV020102',
      createdDepartmentId: divisionMember.departmentId,
    },
    {
      id: 'demo-investment-health-short-debt',
      investmentNo: 'I202608990005',
      customerId: 'demo-customer-health-tech',
      customerNo: 'C202608990002',
      productId: 'demo-product-short-debt-cash',
      amount: decimal(200_000),
      contractedBy: marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: marketHead.departmentId,
      createdBy: divisionTwoHead.id,
      createdEmployeeNo: 'DIV020201',
      createdDepartmentId: divisionTwoHead.departmentId,
    },
  ];

  for (const investment of investments) {
    await upsertInvestment({ ...investment, investedAt: new Date('2026-08-20'), remark: '演示：客户投资自动产生本金佣金' });
    await resetInvestmentCommissions(investment, investment.id === 'demo-investment-bay-industry');
  }

  const investmentsById = new Map(investments.map((item) => [item.id, item]));
  const profitSnapshot: ProfitRatioSnapshot = {
    configId: 'demo-profit-share-202608',
    customerRatio: '62',
    departmentRatio: '12',
    contractedUserRatio: '8',
    createdUserRatio: '8',
    companyRatio: '10',
    effectiveFrom: new Date('2026-08-01').toISOString(),
  };

  await resetYieldProfits({
    id: 'demo-yield-industry-202608',
    productId: 'demo-product-industry-upgrade-2',
    productInvestmentIds: ['demo-investment-bay-industry', 'demo-investment-health-industry', 'demo-investment-lin-industry'],
    periodStart: new Date('2026-08-01'),
    periodEnd: new Date('2026-08-31'),
    totalProfit: decimal(70_000),
    status: 'SETTLED',
    createdBy: admin.id,
    ratioSnapshot: profitSnapshot,
    investmentsById,
  });
  await resetYieldProfits({
    id: 'demo-yield-industry-202609',
    productId: 'demo-product-industry-upgrade-2',
    productInvestmentIds: ['demo-investment-bay-industry', 'demo-investment-health-industry', 'demo-investment-lin-industry'],
    periodStart: new Date('2026-09-01'),
    periodEnd: new Date('2026-09-30'),
    totalProfit: decimal(105_000),
    status: 'CONFIRMED',
    createdBy: admin.id,
    ratioSnapshot: profitSnapshot,
    investmentsById,
  });
  await resetYieldProfits({
    id: 'demo-yield-short-debt-202609',
    productId: 'demo-product-short-debt-cash',
    productInvestmentIds: ['demo-investment-bay-short-debt', 'demo-investment-health-short-debt'],
    periodStart: new Date('2026-09-01'),
    periodEnd: new Date('2026-09-30'),
    totalProfit: decimal(15_000),
    status: 'CONFIRMED',
    createdBy: admin.id,
    ratioSnapshot: profitSnapshot,
    investmentsById,
  });

  await prisma.productYieldPeriod.upsert({
    where: {
      productId_periodStart_periodEnd: {
        productId: 'demo-product-industry-upgrade-2',
        periodStart: new Date('2026-10-01'),
        periodEnd: new Date('2026-10-31'),
      },
    },
    update: {
      totalProfit: decimal(0),
      status: 'DRAFT',
      remark: '演示：草稿收益周期，尚未生成客户收益',
    },
    create: {
      id: 'demo-yield-industry-202610-draft',
      productId: 'demo-product-industry-upgrade-2',
      periodStart: new Date('2026-10-01'),
      periodEnd: new Date('2026-10-31'),
      totalProfit: decimal(0),
      status: 'DRAFT',
      remark: '演示：草稿收益周期，尚未生成客户收益',
      createdBy: admin.id,
    },
  });

  console.log('投资业务演示数据初始化完成：');
  console.log('  客户：C202608990001 大湾区智造有限公司、C202608990002 华南医疗科技有限公司、C202608990003 林女士');
  console.log('  产品：P202608002 产业升级二号、P202608003 短债现金管理、P202608004 历史封闭项目、P202608005 储备草稿产品');
  console.log('  本金佣金配置：签约部门1%，签约人2%，公司0.5%，合计3.5%');
  console.log('  收益分配配置：客户62%，签约部门12%，签约人8%，录入人8%，公司10%');
  console.log('  重点查看：客户投资 I202608990001 / I202608990002 / I202608990003 的详情抽屉');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
