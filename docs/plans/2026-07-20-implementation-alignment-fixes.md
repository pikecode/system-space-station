# 实现与架构设计对齐实施计划

> **执行要求：** 按任务顺序实施，每项完成后运行对应测试；不改变模块化单体架构。

**目标：** 修复当前实现中的越权、敏感字段泄露、组织与财务数据不一致，并补齐设计文档要求的调度和前端业务闭环。

**架构：** 保留 NestJS + Prisma + React monorepo。后端以服务层事务维护不变量，Prisma schema 固化历史组织快照，scheduler 使用 PostgreSQL 事务级 advisory lock；前端只调用受约束的业务端点。

**技术栈：** NestJS 10、Prisma 5、PostgreSQL、React 18、TanStack Query、Vitest、ESLint。

---

### 任务 1：建立测试与质量门禁

**文件：**
- 修改：`apps/api/package.json`
- 修改：`apps/web/package.json`
- 创建：`apps/api/src/modules/**/*.spec.ts`

**步骤：**
1. 增加 Vitest、ESLint 依赖和 `test` 脚本。
2. 为权限判断、用户响应脱敏、部门层级校验、会员审批和调度归集编写回归测试。
3. 运行 `pnpm test`、`pnpm lint`，确认测试与静态检查可执行。

### 任务 2：修复权限与组织事务

**文件：**
- 修改：`apps/api/src/modules/users/users.service.ts`
- 修改：`apps/api/src/modules/users/dto/update-user.dto.ts`
- 修改：`apps/api/src/modules/memberships/memberships.service.ts`
- 修改：`apps/api/src/modules/departments/departments.service.ts`

**步骤：**
1. 所有用户响应显式排除 `passwordHash` 和 `authVersion`。
2. 从普通编辑 DTO 移除 `role`、`departmentId`，角色/部门只经调岗事务修改。
3. 校验接任者必须在职、属于原部门、不能是本人，并同步 HEAD 角色。
4. 为会员创建、退款申请和退款审批增加角色、所有权及部门范围校验。
5. 校验部门父子类型、最大深度和环路。
6. 在调岗、状态、客户转移和配置创建事务中写入 AuditLog。

### 任务 3：补齐财务快照、数据库约束和调度

**文件：**
- 修改：`apps/api/prisma/schema.prisma`
- 创建：`apps/api/prisma/migrations/*_alignment_fixes/migration.sql`
- 创建：`apps/api/src/modules/scheduler/*`
- 修改：`apps/api/src/modules/commissions/commissions.service.ts`
- 修改：`apps/api/src/app.module.ts`

**步骤：**
1. 为分成记录增加审批时部门快照，并按该快照查询历史部门报表。
2. 增加配置比例、结算天数、账目符号以及单 OPEN 周期数据库约束。
3. 实现会员到期和周期关闭事务，使用 `pg_try_advisory_xact_lock`。
4. 以 `[startDate, endDate)` 归集流水，固化费用、退款、净额和条数，并连续创建下一周期。
5. 失败与跳过日志在业务事务外写入 SchedulerLog。

### 任务 4：补齐前端业务路径

**文件：**
- 修改：`apps/web/src/router/index.tsx`
- 修改：`apps/web/src/layouts/AppLayout.tsx`
- 修改：`apps/web/src/pages/admin/users/UsersPage.tsx`
- 修改：`apps/web/src/pages/dept/approvals/ApprovalsPage.tsx`
- 修改：`apps/web/src/pages/my/memberships/MembershipsPage.tsx`
- 修改：`apps/web/src/pages/admin/customers/AdminCustomersPage.tsx`

**步骤：**
1. 增加 HEAD 路由保护、部门客户和部门分成路由。
2. 用户调岗与禁用 HEAD 时收集目标部门和接任者，不再走普通编辑接口。
3. 审批时要求负责人填写收款时间，成员创建时不允许提交 `paidAt`。
4. 增加拒绝后重提、退款申请和退款审批入口。
5. 管理员客户页调整为只读。

### 任务 5：完整验证

**步骤：**
1. 运行 `prisma validate` 和迁移状态检查。
2. 运行 `pnpm test`、`pnpm lint`、`pnpm type-check`。
3. 运行 API/Web 生产构建。
4. 启动本地服务，用浏览器验证 ADMIN、HEAD、MEMBER 的关键路由和表单。
5. 确认 `git status` 仅包含预期源码、迁移、测试和计划文件。
