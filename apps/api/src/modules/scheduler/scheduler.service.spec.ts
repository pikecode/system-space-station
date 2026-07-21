import { describe, expect, it, vi } from 'vitest';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  it('仅把已到期的有效会员标记为到期', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const createLog = vi.fn().mockResolvedValue({});
    const service = new SchedulerService({
      membership: { updateMany },
      schedulerLog: { create: createLog },
    } as never);
    const now = new Date('2026-07-20T08:00:00+08:00');

    const count = await service.expireMemberships(now);

    expect(count).toBe(2);
    expect(updateMany.mock.calls[0][0].where.status).toBe('APPROVED');
    expect(createLog.mock.calls[0][0].data.status).toBe('SUCCESS');
  });
});
