# Customer Membership Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 落地方案 A 的第一阶段，让客户先成为意向会员，缴费确认后再成为正式会员并生成客户登录编号。

**Architecture:** 客户主档保存当前状态、签约归属和正式会员账号；入会记录保存审批、缴费和签约快照；客户端登录使用独立 `subjectType=CUSTOMER` 的 JWT，并通过 `customer-portal` 接口隔离访问范围。

**Tech Stack:** NestJS、Prisma、PostgreSQL、Vitest、Taro 小程序后续接入。

---

### Task 1: 数据模型迁移

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260818110000_customer_membership_phase1/migration.sql`
- Modify: `packages/shared/src/enums/index.ts`

**Steps:**
1. `CustomerStatus` 增加 `PROSPECT` 和 `ACTIVE_MEMBER`，客户默认状态改为 `PROSPECT`。
2. `MembershipStatus` 增加 `PAID`。
3. `Customer` 新增 `customerNo`、`customerPasswordHash`、`memberActivatedAt`、`customerLastLoginAt`、签约人和签约部门字段。
4. `Membership` 新增签约快照、缴费金额和缴费确认人字段。
5. 运行 `pnpm --filter api prisma:generate`。

### Task 2: 客户签约归属

**Files:**
- Create: `apps/api/src/modules/customers/dto/contract-customer.dto.ts`
- Modify: `apps/api/src/modules/customers/customers.controller.ts`
- Modify: `apps/api/src/modules/customers/customers.service.ts`

**Steps:**
1. 新增 `PATCH /customers/:id/contract`。
2. 请求传入签约员工编号和签约时间。
3. 后端按员工编号查在职员工和部门。
4. 写入客户主档签约字段和审计日志。

### Task 3: 入会审批与缴费确认拆分

**Files:**
- Create: `apps/api/src/modules/memberships/dto/confirm-payment.dto.ts`
- Modify: `apps/api/src/modules/memberships/memberships.controller.ts`
- Modify: `apps/api/src/modules/memberships/memberships.service.ts`
- Modify: `packages/shared/src/dto/memberships.dto.ts`

**Steps:**
1. 审批通过只把申请从 `PENDING` 改为 `APPROVED`，不要求 `paidAt`，不生成分成。
2. 新增 `PATCH /memberships/:id/confirm-payment`。
3. 确认缴费时把会员改为 `PAID`，客户改为 `ACTIVE_MEMBER`。
4. 若客户无 `customerNo`，生成 `CYYYYMM######` 编号。
5. 确认缴费时生成会员费分成记录。

### Task 4: 客户登录与客户门户

**Files:**
- Modify: `apps/api/src/modules/auth/dto/login.dto.ts`
- Modify: `apps/api/src/modules/auth/auth.controller.ts`
- Modify: `apps/api/src/modules/auth/auth.service.ts`
- Modify: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/modules/customer-portal/customer-portal.controller.ts`
- Create: `apps/api/src/modules/customer-portal/customer-portal.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `packages/shared/src/dto/auth.dto.ts`

**Steps:**
1. 新增 `POST /auth/customer-login`。
2. 仅允许 `ACTIVE_MEMBER` 且有密码的客户登录。
3. JWT 增加 `subjectType=CUSTOMER`。
4. 新增 `GET /customer-portal/me` 返回客户自己的基础信息和最近会员记录。

### Task 5: 测试和验证

**Files:**
- Modify: `apps/api/src/modules/memberships/memberships.service.spec.ts`
- Modify: `apps/api/src/modules/auth/auth.service.spec.ts`

**Steps:**
1. 覆盖审批通过不再生成分成。
2. 覆盖确认缴费生成正式客户编号。
3. 覆盖非正式客户不能客户登录。
4. 运行 `pnpm type-check`、`pnpm lint`、`pnpm --filter api test`。

---

## 第二阶段边界

收益管理表、收益比例配置、收益录入和收益分配明细不进入第一阶段提交。第一阶段只提供稳定的正式会员身份、签约归属和缴费确认基础。
