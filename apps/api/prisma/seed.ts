import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化种子数据...');

  // 1. 总部
  const hq = await prisma.department.upsert({
    where: { id: 'dept-hq' },
    update: {},
    create: {
      id: 'dept-hq',
      name: '总公司',
      type: 'HQ',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      addressDetail: '天河路385号',
    },
  });

  // 2. 直属部门
  await prisma.department.upsert({
    where: { id: 'dept-direct' },
    update: {},
    create: {
      id: 'dept-direct',
      name: '直属运营部',
      type: 'DIRECT',
      parentId: hq.id,
    },
  });

  // 3. 市场部（示例1个）
  const market1 = await prisma.department.upsert({
    where: { id: 'dept-market-1' },
    update: {},
    create: {
      id: 'dept-market-1',
      name: '华南市场部',
      type: 'MARKET',
      parentId: hq.id,
      province: '广东省',
      city: '广州市',
    },
  });

  // 4. 事业部
  const division1 = await prisma.department.upsert({
    where: { id: 'dept-div-1' },
    update: {},
    create: {
      id: 'dept-div-1',
      name: '广州事业部',
      type: 'DIVISION',
      parentId: market1.id,
      province: '广东省',
      city: '广州市',
    },
  });

  // 5. 岗位
  const pos1 = await prisma.position.upsert({
    where: { id: 'pos-advisor' },
    update: {},
    create: { id: 'pos-advisor', name: '销售顾问' },
  });

  // 6. 用户 - 系统管理员
  const adminPwd = await bcrypt.hash('Admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      name: '系统管理员',
      phone: '13800000000',
      passwordHash: adminPwd,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 7. 市场部负责人
  const headPwd = await bcrypt.hash('Head123456', 10);
  const marketHead = await prisma.user.upsert({
    where: { phone: '13800000001' },
    update: {},
    create: {
      name: '王市场',
      phone: '13800000001',
      passwordHash: headPwd,
      role: 'HEAD',
      departmentId: market1.id,
      positionId: pos1.id,
      status: 'ACTIVE',
    },
  });
  await prisma.department.update({ where: { id: market1.id }, data: { headId: marketHead.id } });

  // 8. 事业部负责人
  const divHeadPwd = await bcrypt.hash('Head123456', 10);
  const divHead = await prisma.user.upsert({
    where: { phone: '13800000002' },
    update: {},
    create: {
      name: '李事业',
      phone: '13800000002',
      passwordHash: divHeadPwd,
      role: 'HEAD',
      departmentId: division1.id,
      positionId: pos1.id,
      status: 'ACTIVE',
    },
  });
  await prisma.department.update({ where: { id: division1.id }, data: { headId: divHead.id } });

  // 9. 普通成员
  const memberPwd = await bcrypt.hash('Member123456', 10);
  await prisma.user.upsert({
    where: { phone: '13800000003' },
    update: {},
    create: {
      name: '张销售',
      phone: '13800000003',
      passwordHash: memberPwd,
      role: 'MEMBER',
      departmentId: division1.id,
      positionId: pos1.id,
      status: 'ACTIVE',
    },
  });

  // 10. 分成配置
  await prisma.commissionConfig.upsert({
    where: { id: 'config-default' },
    update: {},
    create: {
      id: 'config-default',
      memberRatio: 40,
      deptHeadRatio: 20,
      marketHeadRatio: 15,
      companyRatio: 25,
      settlementDays: 15,
      effectiveFrom: new Date('2024-01-01'),
      remark: '默认配置',
      createdBy: admin.id,
    },
  });

  // 11. 初始结算周期（OPEN）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 15);

  const existingPeriod = await prisma.settlementPeriod.findFirst({ where: { status: 'OPEN' } });
  if (!existingPeriod) {
    await prisma.settlementPeriod.create({
      data: { startDate: today, endDate, status: 'OPEN' },
    });
  }

  // 12. 会员等级
  await prisma.memberLevel.upsert({
    where: { id: 'level-basic' },
    update: {},
    create: { id: 'level-basic', name: '普通会员', sort: 1 },
  });
  await prisma.memberLevel.upsert({
    where: { id: 'level-silver' },
    update: {},
    create: { id: 'level-silver', name: '银卡会员', sort: 2 },
  });
  await prisma.memberLevel.upsert({
    where: { id: 'level-gold' },
    update: {},
    create: { id: 'level-gold', name: '金卡会员', sort: 3 },
  });

  console.log('种子数据初始化完成');
  console.log('测试账号：');
  console.log('  管理员：13800000000 / Admin123456');
  console.log('  市场部负责人：13800000001 / Head123456');
  console.log('  事业部负责人：13800000002 / Head123456');
  console.log('  销售成员：13800000003 / Member123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
