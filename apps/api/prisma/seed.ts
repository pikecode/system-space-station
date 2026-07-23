import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化种子数据...');

  // ── 1. 总经办 (HQ) ────────────────────────────────────────────────────────
  const hq = await prisma.department.upsert({
    where: { id: 'dept-hq' },
    update: {},
    create: {
      id: 'dept-hq',
      name: '总经办',
      type: 'HQ',
      sort: 0,
      province: '广东省',
      city: '广州市',
      district: '天河区',
      addressDetail: '天河路385号',
    },
  });

  // ── 2. 直属战略单元（挂 HQ 下，DIRECT 类型）────────────────────────────────
  const directUnits = [
    { id: 'dept-expert',    name: '专家顾问团',   sort: 10 },
    { id: 'dept-secretary', name: '协调秘书处',   sort: 11 },
    { id: 'dept-invest',    name: '对外投资部',   sort: 12 },
    { id: 'dept-legal',     name: '综合法务部',   sort: 13 },
    { id: 'dept-asset',     name: '资产管理部',   sort: 14 },
    { id: 'dept-charity',   name: '公益基金',     sort: 15 },
    { id: 'dept-biz-cmte',  name: '经营决策委员会', sort: 16 },
  ];
  for (const u of directUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, type: 'DIRECT', parentId: hq.id },
    });
  }

  // ── 3. 四大中心 (CENTER) ───────────────────────────────────────────────────
  const supervision = await prisma.department.upsert({
    where: { id: 'dept-center-supervision' },
    update: {},
    create: { id: 'dept-center-supervision', name: '督导中心', type: 'CENTER', parentId: hq.id, sort: 20 },
  });
  const development = await prisma.department.upsert({
    where: { id: 'dept-center-development' },
    update: {},
    create: { id: 'dept-center-development', name: '发展中心', type: 'CENTER', parentId: hq.id, sort: 21 },
  });
  const marketing = await prisma.department.upsert({
    where: { id: 'dept-center-marketing' },
    update: {},
    create: { id: 'dept-center-marketing', name: '营销中心', type: 'CENTER', parentId: hq.id, sort: 22 },
  });
  const service = await prisma.department.upsert({
    where: { id: 'dept-center-service' },
    update: {},
    create: { id: 'dept-center-service', name: '服务中心', type: 'CENTER', parentId: hq.id, sort: 23 },
  });

  // ── 4. 督导中心下属（DIRECT）───────────────────────────────────────────────
  const supervisionUnits = [
    { id: 'dept-sup-exec',  name: '执行督导处', sort: 30 },
    { id: 'dept-sup-audit', name: '财务审计处', sort: 31 },
    { id: 'dept-sup-risk',  name: '风险管理处', sort: 32 },
  ];
  for (const u of supervisionUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, type: 'DIRECT', parentId: supervision.id },
    });
  }

  // ── 5. 发展中心下属（DIRECT）───────────────────────────────────────────────
  const devUnits = [
    { id: 'dept-dev-research',  name: '市场调研处', sort: 40 },
    { id: 'dept-dev-standard',  name: '标准制定处', sort: 41 },
    { id: 'dept-dev-data',      name: '数据应用处', sort: 42 },
    { id: 'dept-dev-ip',        name: '知识产权处', sort: 43 },
    { id: 'dept-dev-capital',   name: '资本运作处', sort: 44 },
    { id: 'dept-dev-brand',     name: '品牌建设部', sort: 45 },
    { id: 'dept-dev-academy',   name: '商学院',     sort: 46 },
  ];
  for (const u of devUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, type: 'DIRECT', parentId: development.id },
    });
  }

  // ── 6. 服务中心下属（DIRECT）───────────────────────────────────────────────
  const serviceUnits = [
    { id: 'dept-svc-hr',      name: '人力资源部',   sort: 50 },
    { id: 'dept-svc-finance', name: '财务结算部',   sort: 51 },
    { id: 'dept-svc-product', name: '产品开发部',   sort: 52 },
    { id: 'dept-svc-admin',   name: '行政支持部',   sort: 53 },
    { id: 'dept-svc-family',  name: '幸福家庭促进会', sort: 54 },
  ];
  for (const u of serviceUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, type: 'DIRECT', parentId: service.id },
    });
  }

  // ── 7. 营销中心下属市场部（MARKET）────────────────────────────────────────
  const marketDepts = [
    { id: 'dept-market-1', name: '市场部一部', sort: 60 },
    { id: 'dept-market-2', name: '市场部二部', sort: 61 },
    { id: 'dept-market-3', name: '市场部三部', sort: 62 },
    { id: 'dept-market-5', name: '市场部五部', sort: 63 },
    { id: 'dept-market-6', name: '市场部六部', sort: 64 },
    { id: 'dept-market-7', name: '市场部七部', sort: 65 },
    { id: 'dept-market-8', name: '市场部八部', sort: 66 },
  ];
  for (const m of marketDepts) {
    await prisma.department.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, type: 'MARKET', parentId: marketing.id },
    });
  }

  // ── 8. 事业部（DIVISION，分配到对应市场部）───────────────────────────────
  const divisionDepts = [
    { id: 'dept-div-1', name: '事业1部', parentId: 'dept-market-1', sort: 70 },
    { id: 'dept-div-2', name: '事业2部', parentId: 'dept-market-2', sort: 71 },
    { id: 'dept-div-3', name: '事业3部', parentId: 'dept-market-3', sort: 72 },
    { id: 'dept-div-5', name: '事业5部', parentId: 'dept-market-5', sort: 73 },
    { id: 'dept-div-6', name: '事业6部', parentId: 'dept-market-6', sort: 74 },
  ];
  for (const d of divisionDepts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, name: d.name, type: 'DIVISION', parentId: d.parentId, sort: d.sort },
    });
  }

  // ── 9. 岗位 ───────────────────────────────────────────────────────────────
  const pos = await prisma.position.upsert({
    where: { id: 'pos-advisor' },
    update: {},
    create: { id: 'pos-advisor', name: '销售顾问' },
  });

  // ── 10. 系统管理员 ────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash('Admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: { username: 'admin' },
    create: {
      name: '系统管理员',
      username: 'admin',
      phone: '13800000000',
      passwordHash: adminPwd,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // ── 11. 市场部示例负责人 ──────────────────────────────────────────────────
  const headPwd = await bcrypt.hash('Head123456', 12);
  const marketHead = await prisma.user.upsert({
    where: { phone: '13800000001' },
    update: { employeeNo: 'MKT001' },
    create: {
      name: '王市场',
      phone: '13800000001',
      employeeNo: 'MKT001',
      passwordHash: headPwd,
      role: 'HEAD',
      departmentId: 'dept-market-1',
      positionId: pos.id,
      status: 'ACTIVE',
    },
  });
  await prisma.department.update({ where: { id: 'dept-market-1' }, data: { headId: marketHead.id } });

  // ── 12. 事业部示例负责人 ──────────────────────────────────────────────────
  const divHeadPwd = await bcrypt.hash('Head123456', 12);
  const divHead = await prisma.user.upsert({
    where: { phone: '13800000002' },
    update: { employeeNo: 'DIV001' },
    create: {
      name: '李事业',
      phone: '13800000002',
      employeeNo: 'DIV001',
      passwordHash: divHeadPwd,
      role: 'HEAD',
      departmentId: 'dept-div-1',
      positionId: pos.id,
      status: 'ACTIVE',
    },
  });
  await prisma.department.update({ where: { id: 'dept-div-1' }, data: { headId: divHead.id } });

  // ── 13. 普通成员 ──────────────────────────────────────────────────────────
  const memberPwd = await bcrypt.hash('Member123456', 12);
  await prisma.user.upsert({
    where: { phone: '13800000003' },
    update: { employeeNo: 'EMP001' },
    create: {
      name: '张销售',
      phone: '13800000003',
      employeeNo: 'EMP001',
      passwordHash: memberPwd,
      role: 'MEMBER',
      departmentId: 'dept-div-1',
      positionId: pos.id,
      status: 'ACTIVE',
    },
  });

  // ── 14. 分成配置 ──────────────────────────────────────────────────────────
  const existingConfig = await prisma.commissionConfig.findUnique({ where: { id: 'config-default' } });
  if (!existingConfig) {
    await prisma.commissionConfig.create({
      data: {
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
  }

  // ── 15. 初始结算周期 ──────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 15);
  const existingPeriod = await prisma.settlementPeriod.findFirst({ where: { status: 'OPEN' } });
  if (!existingPeriod) {
    await prisma.settlementPeriod.create({ data: { startDate: today, endDate, status: 'OPEN' } });
  }

  // ── 16. 会员等级 ──────────────────────────────────────────────────────────
  await prisma.memberLevel.upsert({ where: { id: 'level-basic'  }, update: {}, create: { id: 'level-basic',  name: '普通会员', sort: 1 } });
  await prisma.memberLevel.upsert({ where: { id: 'level-silver' }, update: {}, create: { id: 'level-silver', name: '银卡会员', sort: 2 } });
  await prisma.memberLevel.upsert({ where: { id: 'level-gold'   }, update: {}, create: { id: 'level-gold',   name: '金卡会员', sort: 3 } });

  console.log('种子数据初始化完成，共写入组织架构：');
  console.log('  总经办 1 个');
  console.log('  直属战略单元 7 个');
  console.log('  四大中心 4 个');
  console.log('  督导中心下属 3 个');
  console.log('  发展中心下属 7 个');
  console.log('  服务中心下属 5 个');
  console.log('  市场部 7 个（营销中心下）');
  console.log('  事业部 5 个');
  console.log('测试账号：');
  console.log('  管理员：admin（或13800000000）/ Admin123456');
  console.log('  市场部负责人：13800000001 / Head123456');
  console.log('  事业部负责人：13800000002 / Head123456');
  console.log('  销售成员：13800000003 / Member123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
