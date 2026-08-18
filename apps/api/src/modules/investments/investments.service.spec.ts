import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { InvestmentsService } from './investments.service';

describe('InvestmentsService', () => {
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
});
