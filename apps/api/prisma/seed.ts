import { PrismaClient, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedEmployee = {
  phone: string;
  name: string;
  employeeNo: string;
  role: 'HEAD' | 'MEMBER';
  departmentId: string;
  positionId: string;
  userType?: UserType;
};

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
    { id: 'dept-dev-academy',   name: '勤公学院',   sort: 46 },
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
    { id: 'dept-market-center', name: '市场部中心部', seq: '01', sort: 60 },
    { id: 'dept-market-1', name: '市场部一部', seq: '02', sort: 61 },
    { id: 'dept-market-2', name: '市场部二部', seq: '03', sort: 62 },
    { id: 'dept-market-3', name: '市场部三部', seq: '04', sort: 63 },
    { id: 'dept-market-5', name: '市场部五部', seq: '05', sort: 64 },
    { id: 'dept-market-6', name: '市场部六部', seq: '06', sort: 65 },
    { id: 'dept-market-7', name: '市场部七部', seq: '07', sort: 66 },
    { id: 'dept-market-8', name: '市场部八部', seq: '08', sort: 67 },
  ];
  for (const m of marketDepts) {
    const marketDept = { id: m.id, name: m.name, code: `MKT${m.seq}`, sort: m.sort };
    await prisma.department.upsert({
      where: { id: m.id },
      update: { name: m.name, code: marketDept.code, sort: m.sort, parentId: marketing.id, type: 'MARKET' },
      create: { ...marketDept, type: 'MARKET', parentId: marketing.id },
    });
  }

  // ── 8. 事业部（DIVISION，每个市场部下固定事业1部、事业2部）────────────────
  const legacyDivisionOneIds: Record<string, string> = {
    '02': 'dept-div-1',
    '03': 'dept-div-2',
    '04': 'dept-div-3',
    '05': 'dept-div-5',
    '06': 'dept-div-6',
  };
  const divisionDepts = marketDepts.flatMap((marketDept, marketIndex) =>
    ['01', '02'].map((divisionSeq, divisionIndex) => ({
      id: divisionSeq === '01'
        ? legacyDivisionOneIds[marketDept.seq] ?? `dept-${marketDept.id.replace('dept-', '')}-div-1`
        : `dept-${marketDept.id.replace('dept-', '')}-div-2`,
      name: `事业${Number(divisionSeq)}部`,
      code: `DIV${marketDept.seq}${divisionSeq}`,
      marketSeq: marketDept.seq,
      divisionSeq,
      parentId: marketDept.id,
      sort: 70 + marketIndex * 2 + divisionIndex,
    })),
  );
  for (const d of divisionDepts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: { name: d.name, code: d.code, type: 'DIVISION', parentId: d.parentId, sort: d.sort, status: 'ACTIVE' },
      create: { id: d.id, name: d.name, code: d.code, type: 'DIVISION', parentId: d.parentId, sort: d.sort },
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
    update: {
      employeeNo: 'MKT0201',
      passwordHash: headPwd,
      role: 'HEAD',
      departmentId: 'dept-market-1',
      positionId: pos.id,
      userType: 'EMPLOYEE',
      status: 'ACTIVE',
      authVersion: { increment: 1 },
    },
    create: {
      name: '王市场',
      phone: '13800000001',
      employeeNo: 'MKT0201',
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
    update: {
      employeeNo: 'DIV020101',
      passwordHash: divHeadPwd,
      role: 'HEAD',
      departmentId: 'dept-div-1',
      positionId: pos.id,
      userType: 'PARTNER',
      status: 'ACTIVE',
      authVersion: { increment: 1 },
    },
    create: {
      name: '李事业',
      phone: '13800000002',
      employeeNo: 'DIV020101',
      passwordHash: divHeadPwd,
      userType: 'PARTNER',
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
    update: {
      employeeNo: 'DIV020102',
      passwordHash: memberPwd,
      role: 'MEMBER',
      departmentId: 'dept-div-1',
      positionId: pos.id,
      userType: 'PARTNER',
      status: 'ACTIVE',
      authVersion: { increment: 1 },
    },
    create: {
      name: '张销售',
      phone: '13800000003',
      employeeNo: 'DIV020102',
      passwordHash: memberPwd,
      userType: 'PARTNER',
      role: 'MEMBER',
      departmentId: 'dept-div-1',
      positionId: pos.id,
      status: 'ACTIVE',
    },
  });

  // ── 14. 营销中心合伙人（有分享码，可通过小程序邀请客户）────────────────────
  const partnerPwd = await bcrypt.hash('Partner123456', 12);
  const partners: Array<{
    phone: string;
    name: string;
    shareCode?: string;
    deptId: string;
    employeeNo?: string;
    role?: 'HEAD' | 'MEMBER';
  }> = [
    { phone: '13900000001', name: '陈合伙一', shareCode: 'AABB11', deptId: 'dept-div-1', employeeNo: 'DIV020106' },
    { phone: '13900000002', name: '刘合伙二', shareCode: 'CCDD22', deptId: 'dept-div-2', employeeNo: 'DIV030106' },
    { phone: '13900000003', name: '赵合伙三', shareCode: 'EEFF33', deptId: 'dept-div-3', employeeNo: 'DIV040106' },
    { phone: '13900000004', name: '孙合伙四', shareCode: 'GGHH44', deptId: 'dept-div-1', employeeNo: 'DIV020107' },
    { phone: '13900000005', name: '周合伙五', shareCode: 'JJKK55', deptId: 'dept-div-2', employeeNo: 'DIV030107' },
    { phone: '13288766776', name: '李四', shareCode: 'LLSS44', deptId: 'dept-div-1', employeeNo: 'DIV020103' },
    { phone: '13222229992', name: '王五', shareCode: 'WW55AA', deptId: 'dept-div-1', employeeNo: 'DIV020104' },
    { phone: '13800000005', name: '22', shareCode: 'TT2205', deptId: 'dept-div-1', employeeNo: 'DIV020105' },
  ];
  for (const p of partners) {
    await prisma.user.upsert({
      where: { phone: p.phone },
      update: {
        name: p.name,
        shareCode: p.shareCode,
        employeeNo: p.employeeNo,
        passwordHash: partnerPwd,
        userType: 'PARTNER',
        role: p.role ?? 'MEMBER',
        departmentId: p.deptId,
        status: 'ACTIVE',
        authVersion: { increment: 1 },
      },
      create: {
        name: p.name,
        phone: p.phone,
        passwordHash: partnerPwd,
        userType: 'PARTNER',
        role: p.role ?? 'MEMBER',
        departmentId: p.deptId,
        employeeNo: p.employeeNo,
        shareCode: p.shareCode,
        status: 'ACTIVE',
      },
    });
  }

  // ── 15. 小程序编号登录测试人员（发展 / 营销 / 服务）──────────────────────
  const miniAppPwd = await bcrypt.hash('Test123456', 12);
  const marketEmployeeNames: Record<string, string[]> = {
    '01': ['秦中心', '吴中心', '郑中心'],
    '02': ['王市场', '胡市场', '袁市场'],
    '03': ['周营销', '朱营销', '苏营销'],
    '04': ['刘三部', '陈三部', '杨三部'],
    '05': ['赵五部', '黄五部', '谢五部'],
    '06': ['孙六部', '徐六部', '程六部'],
    '07': ['何七部', '宋七部', '邓七部'],
    '08': ['林八部', '梁八部', '曹八部'],
  };
  const marketEmployeePhones: Record<string, Record<string, string>> = {
    '02': { '01': '13800000001' },
    '03': { '01': '13800000104' },
  };

  const marketEmployees: SeedEmployee[] = marketDepts.flatMap((dept) =>
    ['01', '02', '03'].map((seat, index) => ({
      phone: marketEmployeePhones[dept.seq]?.[seat] ?? `1380002${dept.seq}${seat}`,
      name: marketEmployeeNames[dept.seq][index],
      employeeNo: `MKT${dept.seq}${seat}`,
      role: seat === '01' ? 'HEAD' : 'MEMBER',
      departmentId: dept.id,
      positionId: pos.id,
    })),
  );

  const divisionEmployeePhones: Record<string, Record<string, string>> = {
    '02-01': { '01': '13800000002', '02': '13800000003' },
  };
  const divisionEmployees: SeedEmployee[] = divisionDepts.flatMap((dept) =>
    ['01', '02'].map((seat, index) => ({
      phone: divisionEmployeePhones[`${dept.marketSeq}-${dept.divisionSeq}`]?.[seat] ??
        `13700${dept.marketSeq}${dept.divisionSeq}${seat}`,
      name: `市${Number(dept.marketSeq)}事业${Number(dept.divisionSeq)}${index === 0 ? '负责人' : '成员'}`,
      employeeNo: `DIV${dept.marketSeq}${dept.divisionSeq}${seat}`,
      role: seat === '01' ? 'HEAD' : 'MEMBER',
      departmentId: dept.id,
      positionId: pos.id,
      userType: UserType.PARTNER,
    })),
  );

  const miniAppUsers: SeedEmployee[] = [
    {
      phone: '13800000101',
      name: '方发展',
      employeeNo: 'DEV0001',
      role: 'HEAD',
      departmentId: 'dept-center-development',
      positionId: pos.id,
    },
    {
      phone: '13800000102',
      name: '许发展',
      employeeNo: 'DEV0101',
      role: 'MEMBER',
      departmentId: 'dept-dev-research',
      positionId: pos.id,
    },
    {
      phone: '13800000107',
      name: '林标准',
      employeeNo: 'DEV0201',
      role: 'MEMBER',
      departmentId: 'dept-dev-standard',
      positionId: pos.id,
    },
    {
      phone: '13800000108',
      name: '高数据',
      employeeNo: 'DEV0301',
      role: 'MEMBER',
      departmentId: 'dept-dev-data',
      positionId: pos.id,
    },
    {
      phone: '13800000109',
      name: '罗知产',
      employeeNo: 'DEV0401',
      role: 'MEMBER',
      departmentId: 'dept-dev-ip',
      positionId: pos.id,
    },
    {
      phone: '13800000110',
      name: '钱资本',
      employeeNo: 'DEV0501',
      role: 'MEMBER',
      departmentId: 'dept-dev-capital',
      positionId: pos.id,
    },
    {
      phone: '13800000111',
      name: '唐品牌',
      employeeNo: 'DEV0601',
      role: 'MEMBER',
      departmentId: 'dept-dev-brand',
      positionId: pos.id,
    },
    {
      phone: '13800000112',
      name: '蒋学院',
      employeeNo: 'DEV0701',
      role: 'MEMBER',
      departmentId: 'dept-dev-academy',
      positionId: pos.id,
    },
    {
      phone: '13800000103',
      name: '马营销',
      employeeNo: 'MKT0001',
      role: 'HEAD',
      departmentId: 'dept-center-marketing',
      positionId: pos.id,
    },
    ...marketEmployees,
    ...divisionEmployees,
    {
      phone: '13800000105',
      name: '沈服务',
      employeeNo: 'SVC0001',
      role: 'HEAD',
      departmentId: 'dept-center-service',
      positionId: pos.id,
    },
    {
      phone: '13800000106',
      name: '何服务',
      employeeNo: 'SVC0301',
      role: 'MEMBER',
      departmentId: 'dept-svc-product',
      positionId: pos.id,
    },
    {
      phone: '13800000113',
      name: '余人资',
      employeeNo: 'SVC0101',
      role: 'MEMBER',
      departmentId: 'dept-svc-hr',
      positionId: pos.id,
    },
    {
      phone: '13800000114',
      name: '冯财务',
      employeeNo: 'SVC0201',
      role: 'MEMBER',
      departmentId: 'dept-svc-finance',
      positionId: pos.id,
    },
    {
      phone: '13800000115',
      name: '梁行政',
      employeeNo: 'SVC0401',
      role: 'MEMBER',
      departmentId: 'dept-svc-admin',
      positionId: pos.id,
    },
    {
      phone: '13800000116',
      name: '郑家庭',
      employeeNo: 'SVC0501',
      role: 'MEMBER',
      departmentId: 'dept-svc-family',
      positionId: pos.id,
    },
  ];

  for (const u of miniAppUsers) {
    const userType = u.userType ?? UserType.EMPLOYEE;
    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        name: u.name,
        employeeNo: u.employeeNo,
        passwordHash: miniAppPwd,
        role: u.role,
        departmentId: u.departmentId,
        positionId: u.positionId,
        userType,
        status: 'ACTIVE',
        authVersion: { increment: 1 },
      },
      create: {
        name: u.name,
        phone: u.phone,
        employeeNo: u.employeeNo,
        passwordHash: miniAppPwd,
        userType,
        role: u.role,
        departmentId: u.departmentId,
        positionId: u.positionId,
        status: 'ACTIVE',
      },
    });

    if (u.role === 'HEAD') {
      await prisma.department.update({
        where: { id: u.departmentId },
        data: { headId: user.id },
      });
    }
  }

  // ── 16. 分成配置 ──────────────────────────────────────────────────────────
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

  // ── 17. 初始结算周期 ──────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 15);
  const existingPeriod = await prisma.settlementPeriod.findFirst({ where: { status: 'OPEN' } });
  if (!existingPeriod) {
    await prisma.settlementPeriod.create({ data: { startDate: today, endDate, status: 'OPEN' } });
  }

  // ── 18. 会员等级 ──────────────────────────────────────────────────────────
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
  console.log('  市场部 8 个（营销中心下）');
  console.log('  事业部 16 个（每个市场部下事业1部、事业2部）');
  console.log('测试账号：');
  console.log('  管理员：admin（或13800000000）/ Admin123456');
  console.log('  市场部负责人：MKT0201 / Test123456（市场部一部）');
  console.log('  事业部负责人：DIV020101 / Test123456（市场部一部 / 事业1部）');
  console.log('  事业部成员：DIV020102 / Test123456（市场部一部 / 事业1部）');
  console.log('  历史合伙人编号登录（密码均为 Partner123456）：');
  console.log('  DIV020106 / Partner123456  陈合伙一（市场部一部 / 事业1部）');
  console.log('  DIV030106 / Partner123456  刘合伙二（市场部二部 / 事业1部）');
  console.log('  DIV040106 / Partner123456  赵合伙三（市场部三部 / 事业1部）');
  console.log('  DIV020107 / Partner123456  孙合伙四（市场部一部 / 事业1部）');
  console.log('  DIV030107 / Partner123456  周合伙五（市场部二部 / 事业1部）');
  console.log('  小程序编号登录测试人员（密码均为 Test123456）：');
  console.log('  DEV0001 / Test123456  发展中心负责人');
  console.log('  DEV0101-DEV0701 / Test123456  发展中心下属部门成员');
  console.log('  MKT0001 / Test123456  营销中心负责人');
  console.log('  MKT0101-MKT0803 / Test123456  市场部固定席位人员');
  console.log('  DIV010101-DIV080202 / Test123456  事业部固定测试人员（市场部序列+事业部序列+席位）');
  console.log('  SVC0001 / Test123456  服务中心负责人');
  console.log('  SVC0101-SVC0501 / Test123456  服务中心下属部门成员');
}

main().catch(console.error).finally(() => prisma.$disconnect());
