import { Prisma, PrismaClient, UserType } from '@prisma/client';
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
    update: { code: 'HQ' },
    create: {
      id: 'dept-hq',
      name: '总经办',
      code: 'HQ',
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
    { id: 'dept-expert',    name: '专家顾问团',     code: 'EXP',  sort: 10 },
    { id: 'dept-secretary', name: '协调秘书处',     code: 'SEC',  sort: 11 },
    { id: 'dept-invest',    name: '对外投资部',     code: 'INV',  sort: 12 },
    { id: 'dept-legal',     name: '综合法务部',     code: 'LEG',  sort: 13 },
    { id: 'dept-asset',     name: '资产管理部',     code: 'AST',  sort: 14 },
    { id: 'dept-charity',   name: '公益基金',       code: 'CHR',  sort: 15 },
    { id: 'dept-biz-cmte',  name: '经营决策委员会', code: 'BIZ',  sort: 16 },
  ];
  for (const u of directUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: { code: u.code },
      create: { ...u, type: 'DIRECT', parentId: hq.id },
    });
  }

  // ── 3. 四大中心 (CENTER) ───────────────────────────────────────────────────
  const supervision = await prisma.department.upsert({
    where: { id: 'dept-center-supervision' },
    update: { code: 'SUP' },
    create: { id: 'dept-center-supervision', name: '督导中心', code: 'SUP', type: 'CENTER', parentId: hq.id, sort: 20 },
  });
  const development = await prisma.department.upsert({
    where: { id: 'dept-center-development' },
    update: { code: 'DEV' },
    create: { id: 'dept-center-development', name: '发展中心', code: 'DEV', type: 'CENTER', parentId: hq.id, sort: 21 },
  });
  const marketing = await prisma.department.upsert({
    where: { id: 'dept-center-marketing' },
    update: { code: 'MKT00' },
    create: { id: 'dept-center-marketing', name: '营销中心', code: 'MKT00', type: 'CENTER', parentId: hq.id, sort: 22 },
  });
  const service = await prisma.department.upsert({
    where: { id: 'dept-center-service' },
    update: { code: 'SVC' },
    create: { id: 'dept-center-service', name: '服务中心', code: 'SVC', type: 'CENTER', parentId: hq.id, sort: 23 },
  });

  // ── 4. 督导中心下属（DIRECT）───────────────────────────────────────────────
  const supervisionUnits = [
    { id: 'dept-sup-exec',  name: '执行督导处', code: 'SUP01', sort: 30 },
    { id: 'dept-sup-audit', name: '财务审计处', code: 'SUP02', sort: 31 },
    { id: 'dept-sup-risk',  name: '风险管理处', code: 'SUP03', sort: 32 },
  ];
  for (const u of supervisionUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: { code: u.code },
      create: { ...u, type: 'DIRECT', parentId: supervision.id },
    });
  }

  // ── 5. 发展中心下属（DIRECT）───────────────────────────────────────────────
  const devUnits = [
    { id: 'dept-dev-research',  name: '市场调研处', code: 'DEV01', sort: 40 },
    { id: 'dept-dev-standard',  name: '标准制定处', code: 'DEV02', sort: 41 },
    { id: 'dept-dev-data',      name: '数据应用处', code: 'DEV03', sort: 42 },
    { id: 'dept-dev-ip',        name: '知识产权处', code: 'DEV04', sort: 43 },
    { id: 'dept-dev-capital',   name: '资本运作处', code: 'DEV05', sort: 44 },
    { id: 'dept-dev-brand',     name: '品牌建设部', code: 'DEV06', sort: 45 },
    { id: 'dept-dev-academy',   name: '勤公学院',   code: 'DEV07', sort: 46 },
  ];
  for (const u of devUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: { code: u.code },
      create: { ...u, type: 'DIRECT', parentId: development.id },
    });
  }

  // ── 6. 服务中心下属（DIRECT）───────────────────────────────────────────────
  const serviceUnits = [
    { id: 'dept-svc-hr',      name: '人力资源部',     code: 'SVC01', sort: 50 },
    { id: 'dept-svc-finance', name: '财务结算部',     code: 'SVC02', sort: 51 },
    { id: 'dept-svc-product', name: '产品开发部',     code: 'SVC03', sort: 52 },
    { id: 'dept-svc-admin',   name: '行政支持部',     code: 'SVC04', sort: 53 },
    { id: 'dept-svc-family',  name: '幸福家庭促进会', code: 'SVC05', sort: 54 },
  ];
  for (const u of serviceUnits) {
    await prisma.department.upsert({
      where: { id: u.id },
      update: { code: u.code },
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

  // ── 11. 总经办及各直属部门人员 ───────────────────────────────────────────
  const stdPwd = await bcrypt.hash('Test123456', 12);

  type SeedUser = {
    id: string;
    phone: string;
    name: string;
    employeeNo: string;
    role: 'HEAD' | 'MEMBER';
    departmentId: string;
  };

  const hqAndDirectUsers: SeedUser[] = [
    // 总经办
    { id: 'u-hq-01', phone: '15900000001', name: '陈总办', employeeNo: 'HQ0001', role: 'HEAD', departmentId: 'dept-hq' },
    { id: 'u-hq-02', phone: '15900000002', name: '吴总办', employeeNo: 'HQ0002', role: 'MEMBER', departmentId: 'dept-hq' },
    // 专家顾问团
    { id: 'u-exp-01', phone: '15900000011', name: '林专家', employeeNo: 'EXP0001', role: 'HEAD', departmentId: 'dept-expert' },
    { id: 'u-exp-02', phone: '15900000012', name: '赵顾问', employeeNo: 'EXP0002', role: 'MEMBER', departmentId: 'dept-expert' },
    // 协调秘书处
    { id: 'u-sec-01', phone: '15900000021', name: '刘秘书', employeeNo: 'SEC0001', role: 'HEAD', departmentId: 'dept-secretary' },
    // 对外投资部
    { id: 'u-inv-01', phone: '15900000031', name: '王投资', employeeNo: 'INV0001', role: 'HEAD', departmentId: 'dept-invest' },
    // 综合法务部
    { id: 'u-leg-01', phone: '15900000041', name: '张法务', employeeNo: 'LEG0001', role: 'HEAD', departmentId: 'dept-legal' },
    // 资产管理部
    { id: 'u-ast-01', phone: '15900000051', name: '孙资产', employeeNo: 'AST0001', role: 'HEAD', departmentId: 'dept-asset' },
    // 公益基金
    { id: 'u-chr-01', phone: '15900000061', name: '郑公益', employeeNo: 'CHR0001', role: 'HEAD', departmentId: 'dept-charity' },
    // 经营决策委员会
    { id: 'u-biz-01', phone: '15900000071', name: '黄决策', employeeNo: 'BIZ0001', role: 'HEAD', departmentId: 'dept-biz-cmte' },
    { id: 'u-biz-02', phone: '15900000072', name: '钱决策', employeeNo: 'BIZ0002', role: 'MEMBER', departmentId: 'dept-biz-cmte' },
    // 督导中心
    { id: 'u-sup-01', phone: '15900000081', name: '周督导', employeeNo: 'SUP0001', role: 'HEAD', departmentId: 'dept-center-supervision' },
    // 执行督导处
    { id: 'u-sup01-01', phone: '15900000091', name: '吴执行', employeeNo: 'SUP010001', role: 'HEAD', departmentId: 'dept-sup-exec' },
    // 财务审计处
    { id: 'u-sup02-01', phone: '15900000101', name: '冯审计', employeeNo: 'SUP020001', role: 'HEAD', departmentId: 'dept-sup-audit' },
    // 风险管理处
    { id: 'u-sup03-01', phone: '15900000111', name: '方风险', employeeNo: 'SUP030001', role: 'HEAD', departmentId: 'dept-sup-risk' },
  ];

  for (const u of hqAndDirectUsers) {
    const created = await prisma.user.upsert({
      where: { phone: u.phone },
      update: {
        name: u.name,
        employeeNo: u.employeeNo,
        passwordHash: stdPwd,
        role: u.role,
        departmentId: u.departmentId,
        status: 'ACTIVE',
        authVersion: { increment: 1 },
      },
      create: {
        id: u.id,
        name: u.name,
        phone: u.phone,
        employeeNo: u.employeeNo,
        passwordHash: stdPwd,
        role: u.role,
        departmentId: u.departmentId,
        status: 'ACTIVE',
      },
    });
    if (u.role === 'HEAD') {
      await prisma.department.update({
        where: { id: u.departmentId },
        data: { headId: created.id },
      });
    }
  }

  // ── 12. 市场部示例负责人 ──────────────────────────────────────────────────
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
      employeeNo: 'DEV010001',
      role: 'MEMBER',
      departmentId: 'dept-dev-research',
      positionId: pos.id,
    },
    {
      phone: '13800000107',
      name: '林标准',
      employeeNo: 'DEV020001',
      role: 'MEMBER',
      departmentId: 'dept-dev-standard',
      positionId: pos.id,
    },
    {
      phone: '13800000108',
      name: '高数据',
      employeeNo: 'DEV030001',
      role: 'MEMBER',
      departmentId: 'dept-dev-data',
      positionId: pos.id,
    },
    {
      phone: '13800000109',
      name: '罗知产',
      employeeNo: 'DEV040001',
      role: 'MEMBER',
      departmentId: 'dept-dev-ip',
      positionId: pos.id,
    },
    {
      phone: '13800000110',
      name: '钱资本',
      employeeNo: 'DEV050001',
      role: 'MEMBER',
      departmentId: 'dept-dev-capital',
      positionId: pos.id,
    },
    {
      phone: '13800000111',
      name: '唐品牌',
      employeeNo: 'DEV060001',
      role: 'MEMBER',
      departmentId: 'dept-dev-brand',
      positionId: pos.id,
    },
    {
      phone: '13800000112',
      name: '蒋学院',
      employeeNo: 'DEV070001',
      role: 'MEMBER',
      departmentId: 'dept-dev-academy',
      positionId: pos.id,
    },
    {
      phone: '13800000103',
      name: '马营销',
      employeeNo: 'MKT000001',
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
      employeeNo: 'SVC030001',
      role: 'MEMBER',
      departmentId: 'dept-svc-product',
      positionId: pos.id,
    },
    {
      phone: '13800000113',
      name: '余人资',
      employeeNo: 'SVC010001',
      role: 'MEMBER',
      departmentId: 'dept-svc-hr',
      positionId: pos.id,
    },
    {
      phone: '13800000114',
      name: '冯财务',
      employeeNo: 'SVC020001',
      role: 'MEMBER',
      departmentId: 'dept-svc-finance',
      positionId: pos.id,
    },
    {
      phone: '13800000115',
      name: '梁行政',
      employeeNo: 'SVC040001',
      role: 'MEMBER',
      departmentId: 'dept-svc-admin',
      positionId: pos.id,
    },
    {
      phone: '13800000116',
      name: '郑家庭',
      employeeNo: 'SVC050001',
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

  // ── 19. 小程序权限测试客户与会员记录 ───────────────────────────────────────
  const requireSeedUser = async (employeeNo: string): Promise<{ id: string; departmentId: string }> => {
    const user = await prisma.user.findUnique({
      where: { employeeNo },
      select: { id: true, departmentId: true },
    });
    if (!user?.departmentId) throw new Error(`种子用户不存在或未分配部门：${employeeNo}`);
    return { id: user.id, departmentId: user.departmentId };
  };

  const usersForCustomerScope = {
    marketHead: await requireSeedUser('MKT0201'),
    divisionHead: await requireSeedUser('DIV020101'),
    divisionMember: await requireSeedUser('DIV020102'),
    marketOneDivisionTwoHead: await requireSeedUser('DIV020201'),
    divisionPartner: await requireSeedUser('DIV030106'),
    marketTwoHead: await requireSeedUser('MKT0301'),
  };
  const enterpriseCustomerPwd = await bcrypt.hash('Corp123456', 12);

  const sampleCustomers = [
    {
      id: 'seed-customer-div020102-a',
      customerType: 'INDIVIDUAL' as const,
      name: '测试客户-事业一部-张销售',
      phone: '18610001001',
      source: 'REFERRAL' as const,
      tags: '小程序测试,本人客户',
      notes: '用于验证事业部成员只能查看和维护自己的客户。',
      gender: 'MALE' as const,
      birthday: new Date('1988-03-12'),
      address: '广州市天河区测试路 1 号',
      riskTolerance: 'MODERATE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 500000,
      assignedTo: usersForCustomerScope.divisionMember.id,
      departmentId: usersForCustomerScope.divisionMember.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      referredBy: usersForCustomerScope.divisionMember.id,
      referrerEmployeeNo: 'DIV020102',
      referrerDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      registrationSource: 'PARTNER' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-div020101-a',
      customerType: 'COMPANY' as const,
      name: '测试客户-事业一部-企业A',
      phone: '18610001002',
      source: 'SELF_DEVELOPED' as const,
      tags: '小程序测试,事业部负责人客户',
      notes: '用于验证事业部负责人可查看本事业部全部客户。',
      creditCode: '91440101TEST0001X',
      industry: '企业服务',
      contactName: '许经理',
      contactPhone: '18610001012',
      legalPerson: '许法人',
      registeredCapital: '1000万人民币',
      assignedTo: usersForCustomerScope.divisionHead.id,
      departmentId: usersForCustomerScope.divisionHead.departmentId,
      createdBy: usersForCustomerScope.divisionHead.id,
      registrationSource: 'SELF' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-div020201-a',
      customerType: 'INDIVIDUAL' as const,
      name: '测试客户-市场一部事业二部',
      phone: '18610001007',
      source: 'ACTIVITY' as const,
      tags: '小程序测试,市场一下属事业2部',
      notes: '用于验证市场部一部负责人能查看下属事业2部客户。',
      gender: 'FEMALE' as const,
      address: '佛山市南海区测试街 7 号',
      riskTolerance: 'CONSERVATIVE' as const,
      assignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
      departmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      createdBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
      registrationSource: 'SELF' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-div030106-a',
      customerType: 'COMPANY' as const,
      name: '测试客户-市场二部-事业客户',
      phone: '18610001003',
      source: 'ACTIVITY' as const,
      tags: '小程序测试,市场树客户',
      notes: '用于验证市场部一部负责人不能查看市场二部下属事业部客户。',
      creditCode: '91440101TEST0003X',
      industry: '教育培训',
      contactName: '刘经理',
      contactPhone: '18610001013',
      assignedTo: usersForCustomerScope.divisionPartner.id,
      departmentId: usersForCustomerScope.divisionPartner.departmentId,
      createdBy: usersForCustomerScope.divisionPartner.id,
      referredBy: usersForCustomerScope.divisionPartner.id,
      referrerEmployeeNo: 'DIV030106',
      referrerDepartmentId: usersForCustomerScope.divisionPartner.departmentId,
      registrationSource: 'PARTNER' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-mkt0201-a',
      customerType: 'COMPANY' as const,
      name: '测试客户-市场一部-总部客户',
      phone: '18610001004',
      source: 'ONLINE' as const,
      tags: '小程序测试,市场部客户',
      notes: '用于验证市场部本部门客户在市场树范围内。',
      creditCode: '91440101TEST0002X',
      industry: '数字营销',
      contactName: '陈总',
      contactPhone: '18610001014',
      assignedTo: usersForCustomerScope.marketHead.id,
      departmentId: usersForCustomerScope.marketHead.departmentId,
      createdBy: usersForCustomerScope.marketHead.id,
      registrationSource: 'SELF' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-mkt0301-a',
      customerType: 'INDIVIDUAL' as const,
      name: '测试客户-市场二部-隔离客户',
      phone: '18610001005',
      source: 'OTHER' as const,
      tags: '小程序测试,跨市场隔离',
      notes: '市场部一部账号不应看到该客户；营销中心和只读中心可看到。',
      gender: 'UNKNOWN' as const,
      assignedTo: usersForCustomerScope.marketTwoHead.id,
      departmentId: usersForCustomerScope.marketTwoHead.departmentId,
      createdBy: usersForCustomerScope.marketTwoHead.id,
      registrationSource: 'SELF' as const,
      status: 'ACTIVE' as const,
    },
    {
      id: 'seed-customer-div020102-inactive',
      customerType: 'INDIVIDUAL' as const,
      name: '测试客户-事业一部-非活跃',
      phone: '18610001006',
      source: 'REFERRAL' as const,
      tags: '小程序测试,非活跃',
      notes: '用于验证客户列表活跃/非活跃统计。',
      gender: 'UNKNOWN' as const,
      assignedTo: usersForCustomerScope.divisionMember.id,
      departmentId: usersForCustomerScope.divisionMember.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      registrationSource: 'PARTNER' as const,
      status: 'INACTIVE' as const,
    },
    {
      id: 'seed-company-prospect-a',
      customerType: 'COMPANY' as const,
      name: '测试企业-意向会员-未提交',
      phone: '18610002001',
      source: 'ONLINE' as const,
      tags: '企业登录测试,意向会员',
      notes: '未缴费、未提交入会申请，不能使用客户编号登录。',
      creditCode: '91440101ENT0001X',
      industry: '智能制造',
      contactName: '林总',
      contactPhone: '18610002011',
      legalPerson: '林意向',
      registeredCapital: '3000万人民币',
      riskTolerance: 'MODERATE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 1000000,
      assignedTo: usersForCustomerScope.divisionMember.id,
      departmentId: usersForCustomerScope.divisionMember.departmentId,
      createdBy: usersForCustomerScope.marketHead.id,
      referredBy: usersForCustomerScope.divisionMember.id,
      referrerEmployeeNo: 'DIV020102',
      referrerDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      contractedAt: new Date('2026-08-10T09:00:00.000Z'),
      registrationSource: 'PARTNER' as const,
      status: 'PROSPECT' as const,
    },
    {
      id: 'seed-company-pending-a',
      customerType: 'COMPANY' as const,
      name: '测试企业-入会待审批',
      phone: '18610002002',
      source: 'ACTIVITY' as const,
      tags: '企业登录测试,待审批',
      notes: '已提交入会申请，仍是意向会员，不能使用客户编号登录。',
      creditCode: '91440101ENT0002X',
      industry: '新能源',
      contactName: '周经理',
      contactPhone: '18610002012',
      legalPerson: '周能源',
      registeredCapital: '5000万人民币',
      riskTolerance: 'AGGRESSIVE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 2000000,
      assignedTo: usersForCustomerScope.divisionMember.id,
      departmentId: usersForCustomerScope.divisionMember.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      referredBy: usersForCustomerScope.divisionMember.id,
      referrerEmployeeNo: 'DIV020102',
      referrerDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      contractedAt: new Date('2026-08-11T10:00:00.000Z'),
      registrationSource: 'PARTNER' as const,
      status: 'PROSPECT' as const,
    },
    {
      id: 'seed-company-approved-unpaid-a',
      customerType: 'COMPANY' as const,
      name: '测试企业-审批通过待缴费',
      phone: '18610002003',
      source: 'SELF_DEVELOPED' as const,
      tags: '企业登录测试,待缴费',
      notes: '审批已通过但未确认缴费，仍不能使用客户编号登录。',
      creditCode: '91440101ENT0003X',
      industry: '企业软件',
      contactName: '何总',
      contactPhone: '18610002013',
      legalPerson: '何软件',
      registeredCapital: '800万人民币',
      riskTolerance: 'MODERATE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 1500000,
      assignedTo: usersForCustomerScope.divisionHead.id,
      departmentId: usersForCustomerScope.divisionHead.departmentId,
      createdBy: usersForCustomerScope.divisionHead.id,
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      contractedAt: new Date('2026-08-12T14:00:00.000Z'),
      registrationSource: 'SELF' as const,
      status: 'PROSPECT' as const,
    },
    {
      id: 'seed-company-paid-gold-a',
      customerType: 'COMPANY' as const,
      name: '测试企业-正式会员-金卡',
      phone: '18610002004',
      source: 'REFERRAL' as const,
      tags: '企业登录测试,正式会员,金卡',
      notes: '正式会员企业账号，用于测试客户编号登录和会员中心展示。',
      creditCode: '91440101ENT0004X',
      industry: '高端装备',
      contactName: '郑董',
      contactPhone: '18610002014',
      legalPerson: '郑装备',
      registeredCapital: '12000万人民币',
      riskTolerance: 'AGGRESSIVE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 5000000,
      customerNo: 'C202608880001',
      customerPasswordHash: enterpriseCustomerPwd,
      memberActivatedAt: new Date('2026-08-13T11:00:00.000Z'),
      assignedTo: usersForCustomerScope.divisionMember.id,
      departmentId: usersForCustomerScope.divisionMember.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      referredBy: usersForCustomerScope.divisionMember.id,
      referrerEmployeeNo: 'DIV020102',
      referrerDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      contractedAt: new Date('2026-08-13T09:00:00.000Z'),
      registrationSource: 'PARTNER' as const,
      status: 'ACTIVE_MEMBER' as const,
    },
    {
      id: 'seed-company-paid-silver-a',
      customerType: 'COMPANY' as const,
      name: '测试企业-正式会员-银卡',
      phone: '18610002005',
      source: 'ONLINE' as const,
      tags: '企业登录测试,正式会员,银卡',
      notes: '第二个正式会员企业账号，用于测试多会员等级展示。',
      creditCode: '91440101ENT0005X',
      industry: '医疗科技',
      contactName: '唐总',
      contactPhone: '18610002015',
      legalPerson: '唐医疗',
      registeredCapital: '6000万人民币',
      riskTolerance: 'CONSERVATIVE' as const,
      isAccreditedInvestor: true,
      investmentAmount: 3000000,
      customerNo: 'C202608880002',
      customerPasswordHash: enterpriseCustomerPwd,
      memberActivatedAt: new Date('2026-08-14T15:20:00.000Z'),
      assignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
      departmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      createdBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      contractedAt: new Date('2026-08-14T10:30:00.000Z'),
      registrationSource: 'SELF' as const,
      status: 'ACTIVE_MEMBER' as const,
    },
  ];

  for (const customer of sampleCustomers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    });
  }

  await prisma.membership.upsert({
    where: { id: 'seed-membership-approved-div020102-a' },
    update: {
      status: 'PAID',
      paidAt: new Date('2026-08-01T10:00:00.000Z'),
      paidAmount: 12000,
      paymentConfirmedBy: usersForCustomerScope.divisionHead.id,
      reviewedBy: usersForCustomerScope.divisionHead.id,
      reviewedAt: new Date('2026-08-01T10:30:00.000Z'),
      approvedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      approvedAssignedTo: usersForCustomerScope.divisionMember.id,
    },
    create: {
      id: 'seed-membership-approved-div020102-a',
      memberNo: 'M20260800001',
      customerId: 'seed-customer-div020102-a',
      memberLevelId: 'level-gold',
      fee: 12000,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-08-01'),
      paidAt: new Date('2026-08-01T10:00:00.000Z'),
      paidAmount: 12000,
      paymentConfirmedBy: usersForCustomerScope.divisionHead.id,
      status: 'PAID',
      submittedBy: usersForCustomerScope.divisionMember.id,
      submittedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      submittedAssignedTo: usersForCustomerScope.divisionMember.id,
      reviewedBy: usersForCustomerScope.divisionHead.id,
      reviewedAt: new Date('2026-08-01T10:30:00.000Z'),
      approvedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      approvedAssignedTo: usersForCustomerScope.divisionMember.id,
    },
  });

  await prisma.membership.upsert({
    where: { id: 'seed-membership-pending-div030106-a' },
    update: {
      status: 'PENDING',
      memberLevelId: 'level-silver',
      fee: 6800,
      submittedDepartmentId: usersForCustomerScope.divisionPartner.departmentId,
      submittedAssignedTo: usersForCustomerScope.divisionPartner.id,
      reviewedBy: null,
      reviewedAt: null,
      approvedDepartmentId: null,
      approvedAssignedTo: null,
      paidAt: null,
      reviewNote: null,
    },
    create: {
      id: 'seed-membership-pending-div030106-a',
      memberNo: 'M20260800002',
      customerId: 'seed-customer-div030106-a',
      memberLevelId: 'level-silver',
      fee: 6800,
      startDate: new Date('2026-08-15'),
      endDate: new Date('2027-08-15'),
      status: 'PENDING',
      submittedBy: usersForCustomerScope.divisionPartner.id,
      submittedDepartmentId: usersForCustomerScope.divisionPartner.departmentId,
      submittedAssignedTo: usersForCustomerScope.divisionPartner.id,
    },
  });

  const upsertSeedMembership = async (membership: {
    id: string;
    memberNo: string;
    customerId: string;
    memberLevelId: string;
    fee: number;
    startDate: Date;
    endDate: Date;
    status: 'PENDING' | 'APPROVED' | 'PAID';
    submittedBy: string;
    submittedDepartmentId: string;
    submittedAssignedTo: string;
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
    approvedDepartmentId?: string | null;
    approvedAssignedTo?: string | null;
    paidAt?: Date | null;
    paidAmount?: number | null;
    paymentConfirmedBy?: string | null;
    contractedBy?: string | null;
    contractedEmployeeNo?: string | null;
    contractedDepartmentId?: string | null;
  }) => {
    await prisma.membership.upsert({
      where: { id: membership.id },
      update: membership,
      create: membership,
    });
  };

  await upsertSeedMembership({
    id: 'seed-membership-pending-company-a',
    memberNo: 'M20260800901',
    customerId: 'seed-company-pending-a',
    memberLevelId: 'level-basic',
    fee: 5000,
    startDate: new Date('2026-08-11'),
    endDate: new Date('2027-08-11'),
    status: 'PENDING',
    submittedBy: usersForCustomerScope.divisionMember.id,
    submittedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
    submittedAssignedTo: usersForCustomerScope.divisionMember.id,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
  });

  await upsertSeedMembership({
    id: 'seed-membership-approved-unpaid-company-a',
    memberNo: 'M20260800902',
    customerId: 'seed-company-approved-unpaid-a',
    memberLevelId: 'level-silver',
    fee: 9000,
    startDate: new Date('2026-08-12'),
    endDate: new Date('2027-08-12'),
    status: 'APPROVED',
    submittedBy: usersForCustomerScope.divisionHead.id,
    submittedDepartmentId: usersForCustomerScope.divisionHead.departmentId,
    submittedAssignedTo: usersForCustomerScope.divisionHead.id,
    reviewedBy: usersForCustomerScope.marketHead.id,
    reviewedAt: new Date('2026-08-12T16:30:00.000Z'),
    approvedDepartmentId: usersForCustomerScope.divisionHead.departmentId,
    approvedAssignedTo: usersForCustomerScope.divisionHead.id,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
  });

  await upsertSeedMembership({
    id: 'seed-membership-paid-company-gold-a',
    memberNo: 'M20260800903',
    customerId: 'seed-company-paid-gold-a',
    memberLevelId: 'level-gold',
    fee: 20000,
    startDate: new Date('2026-08-13'),
    endDate: new Date('2027-08-13'),
    status: 'PAID',
    submittedBy: usersForCustomerScope.divisionMember.id,
    submittedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
    submittedAssignedTo: usersForCustomerScope.divisionMember.id,
    reviewedBy: usersForCustomerScope.marketHead.id,
    reviewedAt: new Date('2026-08-13T10:00:00.000Z'),
    approvedDepartmentId: usersForCustomerScope.divisionMember.departmentId,
    approvedAssignedTo: usersForCustomerScope.divisionMember.id,
    paidAt: new Date('2026-08-13T11:00:00.000Z'),
    paidAmount: 20000,
    paymentConfirmedBy: usersForCustomerScope.marketHead.id,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
  });

  await upsertSeedMembership({
    id: 'seed-membership-paid-company-silver-a',
    memberNo: 'M20260800904',
    customerId: 'seed-company-paid-silver-a',
    memberLevelId: 'level-silver',
    fee: 12000,
    startDate: new Date('2026-08-14'),
    endDate: new Date('2027-08-14'),
    status: 'PAID',
    submittedBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
    submittedDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
    submittedAssignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
    reviewedBy: usersForCustomerScope.marketHead.id,
    reviewedAt: new Date('2026-08-14T14:00:00.000Z'),
    approvedDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
    approvedAssignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
    paidAt: new Date('2026-08-14T15:20:00.000Z'),
    paidAmount: 12000,
    paymentConfirmedBy: usersForCustomerScope.marketHead.id,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
  });

  // ── 20. 投资收益测试数据 ──────────────────────────────────────────────────
  await prisma.profitShareConfig.upsert({
    where: { id: 'profit-share-config-default' },
    update: {
      customerRatio: 60,
      departmentRatio: 15,
      contractedUserRatio: 10,
      createdUserRatio: 10,
      companyRatio: 5,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '投资收益默认分配比例：客户60%，部门15%，签约人10%，录入人10%，公司5%',
    },
    create: {
      id: 'profit-share-config-default',
      customerRatio: 60,
      departmentRatio: 15,
      contractedUserRatio: 10,
      createdUserRatio: 10,
      companyRatio: 5,
      effectiveFrom: new Date('2026-08-01'),
      status: 'ACTIVE',
      remark: '投资收益默认分配比例：客户60%，部门15%，签约人10%，录入人10%，公司5%',
      createdBy: admin.id,
    },
  });

  await prisma.investmentProduct.upsert({
    where: { id: 'seed-product-stable-growth-1' },
    update: {
      productNo: 'P202608001',
      name: '稳健增长一号',
      productType: '固定收益',
      riskLevel: 'MODERATE',
      minAmount: 100000,
      expectedStartAt: new Date('2026-08-15'),
      expectedEndAt: new Date('2027-08-14'),
      status: 'ACTIVE',
      remark: '用于企业会员小程序收益展示测试',
    },
    create: {
      id: 'seed-product-stable-growth-1',
      productNo: 'P202608001',
      name: '稳健增长一号',
      productType: '固定收益',
      riskLevel: 'MODERATE',
      minAmount: 100000,
      expectedStartAt: new Date('2026-08-15'),
      expectedEndAt: new Date('2027-08-14'),
      status: 'ACTIVE',
      remark: '用于企业会员小程序收益展示测试',
      createdBy: admin.id,
    },
  });

  const goldInvestment = await prisma.customerInvestment.upsert({
    where: { id: 'seed-investment-company-gold-a' },
    update: {
      investmentNo: 'I202608880001',
      customerId: 'seed-company-paid-gold-a',
      productId: 'seed-product-stable-growth-1',
      amount: 5000000,
      investedAt: new Date('2026-08-15'),
      status: 'ACTIVE',
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      createdEmployeeNo: 'DIV020102',
      createdDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      remark: '金卡企业测试投资',
    },
    create: {
      id: 'seed-investment-company-gold-a',
      investmentNo: 'I202608880001',
      customerId: 'seed-company-paid-gold-a',
      productId: 'seed-product-stable-growth-1',
      amount: 5000000,
      investedAt: new Date('2026-08-15'),
      status: 'ACTIVE',
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      createdBy: usersForCustomerScope.divisionMember.id,
      createdEmployeeNo: 'DIV020102',
      createdDepartmentId: usersForCustomerScope.divisionMember.departmentId,
      remark: '金卡企业测试投资',
    },
  });

  const silverInvestment = await prisma.customerInvestment.upsert({
    where: { id: 'seed-investment-company-silver-a' },
    update: {
      investmentNo: 'I202608880002',
      customerId: 'seed-company-paid-silver-a',
      productId: 'seed-product-stable-growth-1',
      amount: 3000000,
      investedAt: new Date('2026-08-15'),
      status: 'ACTIVE',
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      createdBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
      createdEmployeeNo: 'DIV020201',
      createdDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      remark: '银卡企业测试投资',
    },
    create: {
      id: 'seed-investment-company-silver-a',
      investmentNo: 'I202608880002',
      customerId: 'seed-company-paid-silver-a',
      productId: 'seed-product-stable-growth-1',
      amount: 3000000,
      investedAt: new Date('2026-08-15'),
      status: 'ACTIVE',
      contractedBy: usersForCustomerScope.marketHead.id,
      contractedEmployeeNo: 'MKT0201',
      contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
      createdBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
      createdEmployeeNo: 'DIV020201',
      createdDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      remark: '银卡企业测试投资',
    },
  });

  await prisma.productYieldPeriod.upsert({
    where: {
      productId_periodStart_periodEnd: {
        productId: 'seed-product-stable-growth-1',
        periodStart: new Date('2026-09-01'),
        periodEnd: new Date('2026-09-30'),
      },
    },
    update: {
      totalProfit: 100000,
      status: 'CONFIRMED',
      confirmedBy: admin.id,
      confirmedAt: new Date('2026-10-01T09:00:00.000Z'),
      remark: '2026年9月产品总收益，按产品总收益录入',
    },
    create: {
      id: 'seed-yield-stable-growth-202609',
      productId: 'seed-product-stable-growth-1',
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-30'),
      totalProfit: 100000,
      status: 'CONFIRMED',
      confirmedBy: admin.id,
      confirmedAt: new Date('2026-10-01T09:00:00.000Z'),
      remark: '2026年9月产品总收益，按产品总收益录入',
      createdBy: admin.id,
    },
  });

  const ratioSnapshot = {
    configId: 'profit-share-config-default',
    customerRatio: '60',
    departmentRatio: '15',
    contractedUserRatio: '10',
    createdUserRatio: '10',
    companyRatio: '5',
    effectiveFrom: new Date('2026-08-01').toISOString(),
  };

  const upsertProfitRecord = async (record: {
    id: string;
    customerId: string;
    investmentId: string;
    customerNo: string;
    principalAmount: number;
    investmentShareRatio: string;
    profitAmount: number;
    customerAmount: number;
    contractedBy: string;
    contractedEmployeeNo: string;
    contractedDepartmentId: string;
    createdBy: string;
    createdEmployeeNo: string;
  }) => {
    await prisma.customerProfitRecord.upsert({
      where: { id: record.id },
      update: {
        principalAmount: record.principalAmount,
        investmentShareRatio: new Prisma.Decimal(record.investmentShareRatio),
        profitAmount: record.profitAmount,
        customerAmount: record.customerAmount,
        ratioSnapshot,
        status: 'GENERATED',
        settledAt: null,
      },
      create: {
        id: record.id,
        customerId: record.customerId,
        investmentId: record.investmentId,
        productId: 'seed-product-stable-growth-1',
        yieldPeriodId: 'seed-yield-stable-growth-202609',
        principalAmount: record.principalAmount,
        investmentShareRatio: new Prisma.Decimal(record.investmentShareRatio),
        profitAmount: record.profitAmount,
        customerAmount: record.customerAmount,
        ratioSnapshot,
        status: 'GENERATED',
      },
    });
    await prisma.profitShareRecord.deleteMany({ where: { profitRecordId: record.id } });
    const departmentAmount = new Prisma.Decimal(record.profitAmount).mul(15).div(100).toDecimalPlaces(2);
    const contractedAmount = new Prisma.Decimal(record.profitAmount).mul(10).div(100).toDecimalPlaces(2);
    const createdAmount = new Prisma.Decimal(record.profitAmount).mul(10).div(100).toDecimalPlaces(2);
    const companyAmount = new Prisma.Decimal(record.profitAmount)
      .minus(record.customerAmount)
      .minus(departmentAmount)
      .minus(contractedAmount)
      .minus(createdAmount)
      .toDecimalPlaces(2);
    await prisma.profitShareRecord.createMany({
      data: [
        { profitRecordId: record.id, receiverType: 'CUSTOMER', receiverId: record.customerId, receiverNo: record.customerNo, ratio: 60, amount: record.customerAmount },
        { profitRecordId: record.id, receiverType: 'DEPARTMENT', receiverId: record.contractedDepartmentId, receiverNo: record.contractedDepartmentId, ratio: 15, amount: departmentAmount },
        { profitRecordId: record.id, receiverType: 'CONTRACTED_USER', receiverId: record.contractedBy, receiverNo: record.contractedEmployeeNo, ratio: 10, amount: contractedAmount },
        { profitRecordId: record.id, receiverType: 'CREATED_USER', receiverId: record.createdBy, receiverNo: record.createdEmployeeNo, ratio: 10, amount: createdAmount },
        { profitRecordId: record.id, receiverType: 'COMPANY', receiverId: 'COMPANY', receiverNo: 'COMPANY', ratio: 5, amount: companyAmount },
      ],
    });
  };

  await upsertProfitRecord({
    id: 'seed-profit-company-gold-202609',
    customerId: 'seed-company-paid-gold-a',
    investmentId: goldInvestment.id,
    customerNo: 'C202608880001',
    principalAmount: 5000000,
    investmentShareRatio: '0.62500000',
    profitAmount: 62500,
    customerAmount: 37500,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
    createdBy: usersForCustomerScope.divisionMember.id,
    createdEmployeeNo: 'DIV020102',
  });

  await upsertProfitRecord({
    id: 'seed-profit-company-silver-202609',
    customerId: 'seed-company-paid-silver-a',
    investmentId: silverInvestment.id,
    customerNo: 'C202608880002',
    principalAmount: 3000000,
    investmentShareRatio: '0.37500000',
    profitAmount: 37500,
    customerAmount: 22500,
    contractedBy: usersForCustomerScope.marketHead.id,
    contractedEmployeeNo: 'MKT0201',
    contractedDepartmentId: usersForCustomerScope.marketHead.departmentId,
    createdBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
    createdEmployeeNo: 'DIV020201',
  });

  await prisma.membership.upsert({
    where: { id: 'seed-membership-pending-div020201-a' },
    update: {
      status: 'PENDING',
      memberLevelId: 'level-basic',
      fee: 3600,
      submittedDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      submittedAssignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
      reviewedBy: null,
      reviewedAt: null,
      approvedDepartmentId: null,
      approvedAssignedTo: null,
      paidAt: null,
      reviewNote: null,
    },
    create: {
      id: 'seed-membership-pending-div020201-a',
      memberNo: 'M20260800003',
      customerId: 'seed-customer-div020201-a',
      memberLevelId: 'level-basic',
      fee: 3600,
      startDate: new Date('2026-08-20'),
      endDate: new Date('2027-08-20'),
      status: 'PENDING',
      submittedBy: usersForCustomerScope.marketOneDivisionTwoHead.id,
      submittedDepartmentId: usersForCustomerScope.marketOneDivisionTwoHead.departmentId,
      submittedAssignedTo: usersForCustomerScope.marketOneDivisionTwoHead.id,
    },
  });

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
  console.log('  DEV010001-DEV070001 / Test123456  发展中心下属部门成员');
  console.log('  MKT000001 / Test123456  营销中心负责人');
  console.log('  MKT0101-MKT0803 / Test123456  市场部固定席位人员');
  console.log('  DIV010101-DIV080202 / Test123456  事业部固定测试人员（市场部序列+事业部序列+席位）');
  console.log('  SVC0001 / Test123456  服务中心负责人');
  console.log('  SVC010001-SVC050001 / Test123456  服务中心下属部门成员');
  console.log('测试客户：');
  console.log('  DIV020102 登录：只看到自己的客户：测试客户-事业一部-张销售、测试客户-事业一部-非活跃');
  console.log('  DIV020101 登录：看到事业1部客户：张销售、企业A、非活跃');
  console.log('  MKT0201 登录：看到市场一部及下属事业1部/事业2部客户，不应看到“市场二部-隔离客户”');
  console.log('  MKT000001 / DEV0001 / SVC0001 登录：可看到全量客户，其中 DEV/SVC 只读');
  console.log('企业会员小程序登录测试账号（密码均为 Corp123456）：');
  console.log('  C202608880001 / Corp123456  测试企业-正式会员-金卡，投资 I202608880001，本期到账收益 37500');
  console.log('  C202608880002 / Corp123456  测试企业-正式会员-银卡，投资 I202608880002，本期到账收益 22500');
  console.log('投资收益测试数据：');
  console.log('  产品 P202608001 稳健增长一号，2026-09 产品总收益 100000');
  console.log('  收益比例：客户60%，部门15%，签约人10%，录入人10%，公司5%；当前为手动结算');
  console.log('企业入会状态测试数据：');
  console.log('  测试企业-意向会员-未提交：PROSPECT，无入会记录，不可客户登录');
  console.log('  测试企业-入会待审批：PROSPECT + PENDING，不可客户登录');
  console.log('  测试企业-审批通过待缴费：PROSPECT + APPROVED，不可客户登录');
  console.log('  测试企业-正式会员-金卡/银卡：ACTIVE_MEMBER + PAID，可客户登录');
}

main().catch(console.error).finally(() => prisma.$disconnect());
