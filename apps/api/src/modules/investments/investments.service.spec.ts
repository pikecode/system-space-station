import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { InvestmentsService } from './investments.service';

describe('InvestmentsService', () => {
  it('创建客户投资未填写签约人时沿用客户签约人快照', async () => {
    const createInvestment = vi.fn().mockResolvedValue({
      id: 'investment-1',
      amount: new Prisma.Decimal(200000),
      contractedBy: 'contracted-user-1',
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: 'dept-market-1',
    });
    const tx = {
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'ACTIVE_MEMBER',
          contractedBy: 'contracted-user-1',
          contractedEmployeeNo: 'MKT0201',
          contractedDepartmentId: 'dept-market-1',
        }),
      },
      investmentProduct: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'product-1',
          status: 'ACTIVE',
          minAmount: new Prisma.Decimal(100000),
        }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'operator-1',
          employeeNo: 'DIV020102',
          departmentId: 'dept-div-1',
        }),
      },
      customerInvestment: {
        count: vi.fn().mockResolvedValue(0),
        create: createInvestment,
      },
      investmentCommissionConfig: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'investment-commission-config-1',
          contractedDepartmentRatio: new Prisma.Decimal(1),
          contractedUserRatio: new Prisma.Decimal(2),
          companyRatio: new Prisma.Decimal(0.5),
          effectiveFrom: new Date('2026-08-01'),
        }),
      },
      investmentCommissionRecord: {
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
      },
      $executeRaw: vi.fn().mockResolvedValue(0),
    };
    const service = new InvestmentsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.createCustomerInvestment({
      customerId: 'customer-1',
      productId: 'product-1',
      amount: 200000,
      investedAt: '2026-08-18',
    }, { id: 'operator-1' });

    expect(tx.user.findUnique).toHaveBeenCalledTimes(1);
    expect(createInvestment.mock.calls[0][0].data).toMatchObject({
      customerId: 'customer-1',
      productId: 'product-1',
      contractedBy: 'contracted-user-1',
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: 'dept-market-1',
      createdBy: 'operator-1',
      createdEmployeeNo: 'DIV020102',
      createdDepartmentId: 'dept-div-1',
    });
    expect(tx.investmentCommissionRecord.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          receiverType: 'CONTRACTED_DEPARTMENT',
          receiverId: 'dept-market-1',
          ratio: new Prisma.Decimal(1),
          amount: new Prisma.Decimal(2000),
        }),
        expect.objectContaining({
          receiverType: 'CONTRACTED_USER',
          receiverId: 'contracted-user-1',
          receiverNo: 'MKT0201',
          ratio: new Prisma.Decimal(2),
          amount: new Prisma.Decimal(4000),
        }),
        expect.objectContaining({
          receiverType: 'COMPANY',
          receiverId: 'COMPANY',
          ratio: new Prisma.Decimal('0.5'),
          amount: new Prisma.Decimal(1000),
        }),
      ]),
    });
  });

  it('确认产品总收益时按投资占比生成客户到账收益和完整分配明细', async () => {
    const profitCreate = vi.fn()
      .mockResolvedValueOnce({ id: 'profit-gold' })
      .mockResolvedValueOnce({ id: 'profit-silver' });
    const shareCreateMany = vi.fn().mockResolvedValue({ count: 5 });
    const tx = {
      productYieldPeriod: {
        findUnique: vi.fn()
          .mockResolvedValueOnce({
            id: 'yield-1',
            productId: 'product-1',
            totalProfit: new Prisma.Decimal(100000),
            status: 'DRAFT',
            product: { id: 'product-1' },
          })
          .mockResolvedValueOnce({ id: 'yield-1', status: 'CONFIRMED', _count: { profitRecords: 2 } }),
        update: vi.fn().mockResolvedValue({}),
      },
      customerProfitRecord: {
        count: vi.fn().mockResolvedValue(0),
        create: profitCreate,
      },
      customerInvestment: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'investment-gold',
            customerId: 'customer-gold',
            productId: 'product-1',
            amount: new Prisma.Decimal(5000000),
            contractedBy: 'contracted-user',
            contractedEmployeeNo: 'MKT0201',
            contractedDepartmentId: 'dept-market-1',
            createdBy: 'created-user-1',
            createdEmployeeNo: 'DIV020102',
            customer: { customerNo: 'C202608880001' },
          },
          {
            id: 'investment-silver',
            customerId: 'customer-silver',
            productId: 'product-1',
            amount: new Prisma.Decimal(3000000),
            contractedBy: 'contracted-user',
            contractedEmployeeNo: 'MKT0201',
            contractedDepartmentId: 'dept-market-1',
            createdBy: 'created-user-2',
            createdEmployeeNo: 'DIV020201',
            customer: { customerNo: 'C202608880002' },
          },
        ]),
      },
      profitShareConfig: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'profit-share-config-default',
          customerRatio: new Prisma.Decimal(60),
          departmentRatio: new Prisma.Decimal(15),
          contractedUserRatio: new Prisma.Decimal(10),
          createdUserRatio: new Prisma.Decimal(10),
          companyRatio: new Prisma.Decimal(5),
          effectiveFrom: new Date('2026-08-01'),
        }),
      },
      profitShareRecord: { createMany: shareCreateMany },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    const service = new InvestmentsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.confirmYieldPeriod('yield-1', 'admin-1');

    expect(profitCreate.mock.calls[0][0].data).toMatchObject({
      customerId: 'customer-gold',
      principalAmount: new Prisma.Decimal(5000000),
      investmentShareRatio: new Prisma.Decimal('0.62500000'),
      profitAmount: new Prisma.Decimal(62500),
      customerAmount: new Prisma.Decimal(37500),
    });
    expect(profitCreate.mock.calls[1][0].data).toMatchObject({
      customerId: 'customer-silver',
      principalAmount: new Prisma.Decimal(3000000),
      investmentShareRatio: new Prisma.Decimal('0.37500000'),
      profitAmount: new Prisma.Decimal(37500),
      customerAmount: new Prisma.Decimal(22500),
    });
    expect(shareCreateMany.mock.calls[0][0].data).toEqual(expect.arrayContaining([
      expect.objectContaining({ receiverType: 'CUSTOMER', receiverNo: 'C202608880001', amount: new Prisma.Decimal(37500) }),
      expect.objectContaining({ receiverType: 'DEPARTMENT', receiverNo: 'dept-market-1', amount: new Prisma.Decimal(9375) }),
      expect.objectContaining({ receiverType: 'CONTRACTED_USER', receiverNo: 'MKT0201', amount: new Prisma.Decimal(6250) }),
      expect.objectContaining({ receiverType: 'CREATED_USER', receiverNo: 'DIV020102', amount: new Prisma.Decimal(6250) }),
      expect.objectContaining({ receiverType: 'COMPANY', receiverNo: 'COMPANY', amount: new Prisma.Decimal(3125) }),
    ]));
    expect(tx.productYieldPeriod.update).toHaveBeenCalledWith({
      where: { id: 'yield-1' },
      data: { status: 'CONFIRMED', confirmedBy: 'admin-1', confirmedAt: expect.any(Date) },
    });
  });

  it('按产品收益周期批量结算客户收益和分配明细', async () => {
    const profitUpdateMany = vi.fn().mockResolvedValue({ count: 2 });
    const shareUpdateMany = vi.fn().mockResolvedValue({ count: 10 });
    const periodUpdate = vi.fn().mockResolvedValue({});
    const tx = {
      productYieldPeriod: {
        findUnique: vi.fn()
          .mockResolvedValueOnce({
            id: 'yield-1',
            status: 'CONFIRMED',
            _count: { profitRecords: 2 },
          })
          .mockResolvedValueOnce({
            id: 'yield-1',
            status: 'SETTLED',
            _count: { profitRecords: 2 },
          }),
        update: periodUpdate,
      },
      customerProfitRecord: {
        count: vi.fn().mockResolvedValue(2),
        updateMany: profitUpdateMany,
      },
      profitShareRecord: {
        updateMany: shareUpdateMany,
      },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    const service = new InvestmentsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.settleYieldPeriod('yield-1', 'admin-1');

    expect(profitUpdateMany.mock.calls[0][0]).toMatchObject({
      where: { yieldPeriodId: 'yield-1', status: 'GENERATED' },
      data: { status: 'SETTLED', settledAt: expect.any(Date) },
    });
    expect(shareUpdateMany.mock.calls[0][0]).toMatchObject({
      where: { profitRecord: { yieldPeriodId: 'yield-1' }, status: 'GENERATED' },
      data: { status: 'SETTLED', settledAt: expect.any(Date) },
    });
    expect(periodUpdate).toHaveBeenCalledWith({
      where: { id: 'yield-1' },
      data: { status: 'SETTLED' },
    });
  });

  it('手动结算投资本金佣金记录', async () => {
    const commissionUpdate = vi.fn().mockResolvedValue({ id: 'investment-commission-1', status: 'SETTLED' });
    const tx = {
      investmentCommissionRecord: {
        findUnique: vi.fn().mockResolvedValue({ id: 'investment-commission-1', status: 'GENERATED' }),
        update: commissionUpdate,
      },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    const service = new InvestmentsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.settleInvestmentCommissionRecord('investment-commission-1', 'admin-1');

    expect(commissionUpdate).toHaveBeenCalledWith({
      where: { id: 'investment-commission-1' },
      data: { status: 'SETTLED', settledAt: expect.any(Date) },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'INVESTMENT_COMMISSION_SETTLE',
        entityType: 'InvestmentCommissionRecord',
        entityId: 'investment-commission-1',
        operatorId: 'admin-1',
      }),
    });
  });
});
