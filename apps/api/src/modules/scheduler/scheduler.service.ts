import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const CLOSE_PERIOD_LOCK_KEY = 2_607_201;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 5 0 * * *', { timeZone: 'Asia/Shanghai' })
  async expireMemberships(now = new Date()) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    try {
      const result = await this.prisma.membership.updateMany({
        where: { status: 'APPROVED', endDate: { lte: today } },
        data: { status: 'EXPIRED' },
      });
      await this.writeLog('expire-memberships', 'SUCCESS', result.count);
      return result.count;
    } catch (error) {
      await this.writeLog('expire-memberships', 'FAILED', 0, this.errorMessage(error));
      this.logger.error('会员到期任务执行失败', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  @Cron('0 10 0 * * *', { timeZone: 'Asia/Shanghai' })
  async closePeriods(now = new Date()) {
    let affectedRows = 0;
    try {
      for (let iteration = 0; iteration < 366; iteration += 1) {
        const result = await this.closeOnePeriod(now);
        if (!result.acquired) {
          await this.writeLog('close-period', 'SKIPPED', affectedRows);
          return affectedRows;
        }
        if (!result.closed) break;
        affectedRows += result.recordCount;
      }
      await this.writeLog('close-period', 'SUCCESS', affectedRows);
      return affectedRows;
    } catch (error) {
      await this.writeLog('close-period', 'FAILED', affectedRows, this.errorMessage(error));
      this.logger.error('结算周期关闭任务执行失败', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  private closeOnePeriod(now: Date) {
    return this.prisma.$transaction(async (tx) => {
      const [lock] = await tx.$queryRaw<Array<{ acquired: boolean }>>(
        Prisma.sql`SELECT pg_try_advisory_xact_lock(${CLOSE_PERIOD_LOCK_KEY}) AS acquired`,
      );
      if (!lock?.acquired) return { acquired: false, closed: false, recordCount: 0 };

      const period = await tx.settlementPeriod.findFirst({
        where: { status: 'OPEN', endDate: { lte: now } },
        orderBy: { startDate: 'asc' },
      });
      if (!period) return { acquired: true, closed: false, recordCount: 0 };

      const records = await tx.commissionRecord.findMany({
        where: {
          status: 'PENDING',
          periodId: null,
          createdAt: { gte: period.startDate, lt: period.endDate },
        },
        include: { membership: { select: { fee: true } } },
      });

      const recordIds = records.map((record) => record.id);
      if (recordIds.length > 0) {
        const updated = await tx.commissionRecord.updateMany({
          where: { id: { in: recordIds }, status: 'PENDING', periodId: null },
          data: { periodId: period.id, status: 'PENDING_PAYMENT' },
        });
        if (updated.count !== recordIds.length) {
          throw new Error('周期归集期间分成记录发生并发变更');
        }
      }

      const earningFees = new Map<string, Prisma.Decimal>();
      const refundFees = new Map<string, Prisma.Decimal>();
      let totalAmount = new Prisma.Decimal(0);
      for (const record of records) {
        totalAmount = totalAmount.add(record.amount);
        const target = record.entryType === 'EARNING' ? earningFees : refundFees;
        target.set(record.membershipId, record.membership.fee);
      }
      const sumFees = (fees: Map<string, Prisma.Decimal>) =>
        [...fees.values()].reduce((sum, fee) => sum.add(fee), new Prisma.Decimal(0));

      await tx.settlementPeriod.update({
        where: { id: period.id, status: 'OPEN' },
        data: {
          totalFee: sumFees(earningFees),
          totalRefundFee: sumFees(refundFees),
          totalAmount,
          recordCount: records.length,
          status: 'PENDING_PAYMENT',
        },
      });

      const config = await tx.commissionConfig.findFirst({
        where: { effectiveFrom: { lte: period.endDate } },
        orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
      });
      if (!config) throw new Error('缺少生效的分成配置，无法创建下一结算周期');

      const nextEndDate = new Date(period.endDate);
      nextEndDate.setDate(nextEndDate.getDate() + config.settlementDays);
      await tx.settlementPeriod.create({
        data: {
          startDate: period.endDate,
          endDate: nextEndDate,
          status: 'OPEN',
        },
      });

      return { acquired: true, closed: true, recordCount: records.length };
    });
  }

  private writeLog(
    taskName: string,
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED',
    affectedRows: number,
    errorMessage?: string,
  ) {
    return this.prisma.schedulerLog.create({
      data: { taskName, status, affectedRows, errorMessage },
    });
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
  }
}
