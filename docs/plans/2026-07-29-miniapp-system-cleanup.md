# 小程序系统整理 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 整理小程序客户、会员、审批、分成主流程，统一接口契约、分页响应和登录守卫，并恢复 TypeScript 静态检查通过。

**Architecture:** 以 `packages/shared` 承载跨端 DTO 和分页类型，小程序 service 只做 HTTP 契约适配，页面层只处理展示和交互。后端补齐会员详情接口，避免小程序通过分页列表反查详情。

**Tech Stack:** Taro 4.2、React 18、TypeScript、Zustand、NestJS、Prisma、pnpm monorepo。

---

### Task 1: 共享类型与分页契约

**Files:**
- Modify: `packages/shared/src/enums/index.ts`
- Create: `packages/shared/src/dto/common.dto.ts`
- Create: `packages/shared/src/dto/customers.dto.ts`
- Create: `packages/shared/src/dto/memberships.dto.ts`
- Create: `packages/shared/src/dto/commissions.dto.ts`
- Modify: `packages/shared/src/index.ts`

**Steps:**
1. 增加 `Gender`、`RiskTolerance`、`CommissionEntryType` 等小程序需要的枚举。
2. 增加通用 `PaginatedResponse<T>`。
3. 增加客户、会员、分成的小程序响应和提交 DTO。
4. 从 `packages/shared/src/index.ts` 统一导出。

**Verify:**

```bash
pnpm --filter shared exec tsc --noEmit
```

### Task 2: 小程序请求层和登录守卫

**Files:**
- Modify: `apps/miniapp/tsconfig.json`
- Create: `apps/miniapp/src/types/env.d.ts`
- Modify: `apps/miniapp/src/services/request.ts`
- Create: `apps/miniapp/src/hooks/useRequireLogin.ts`

**Steps:**
1. 将 TS lib 提升到支持 `Promise.finally` 的版本，或避免依赖不支持的 lib。
2. 为 `process.env.TARO_APP_API_URL` 和 `require` 增加本地类型声明。
3. 请求层统一处理 `401`、错误消息和 query 参数拼接。
4. 提供 `useRequireLogin`，tab 页和登录态页面统一复用。

**Verify:**

```bash
pnpm --filter miniapp exec tsc --noEmit
```

### Task 3: Service 契约整理

**Files:**
- Modify: `apps/miniapp/src/services/customers.ts`
- Modify: `apps/miniapp/src/services/invite.ts`
- Modify: `apps/miniapp/src/services/memberships.ts`
- Modify: `apps/miniapp/src/services/commissions.ts`
- Modify: `apps/miniapp/src/services/auth.ts`

**Steps:**
1. 使用 shared DTO 替换本地漂移的接口类型。
2. 客户、会员、分成列表保留分页响应，页面按需读取 `data`。
3. 注册接口补齐风险承受能力、合格投资人和投资额字段。
4. 增加 `membershipsApi.getOne(id)`，对应后端会员详情接口。

**Verify:**

```bash
pnpm --filter miniapp exec tsc --noEmit
```

### Task 4: 页面入口、守卫和主流程修复

**Files:**
- Modify: `apps/miniapp/src/app.config.ts`
- Modify: `apps/miniapp/src/pages/customers/index.tsx`
- Modify: `apps/miniapp/src/pages/profile/index.tsx`
- Modify: `apps/miniapp/src/pages/approvals/index.tsx`
- Modify: `apps/miniapp/src/pages/commissions/list.tsx`
- Modify: `apps/miniapp/src/pages/memberships/detail.tsx`
- Modify: `apps/miniapp/src/pages/customers/detail.tsx`
- Modify: `apps/miniapp/src/pages/register/index.tsx`

**Steps:**
1. 注册 `pages/approvals/index`。
2. 客户、我的、审批、分成页面进入时检查登录态。
3. Profile 增加会员申请、分成、审批入口，按角色展示。
4. 会员详情改为 `getOne(id)`。
5. 审批通过前提供实际收款日期选择。
6. 修复 Taro `Input` 不支持的 `textAlign` prop。

**Verify:**

```bash
pnpm --filter miniapp exec tsc --noEmit
```

### Task 5: 后端会员详情接口

**Files:**
- Modify: `apps/api/src/modules/memberships/memberships.controller.ts`
- Modify: `apps/api/src/modules/memberships/memberships.service.ts`

**Steps:**
1. 增加 `GET /memberships/:id`。
2. 使用与列表一致的角色范围校验。
3. 返回 customer、memberLevel、submitter 关系，满足详情页展示。

**Verify:**

```bash
pnpm --filter api exec tsc --noEmit
```

### Task 6: 最终验证

**Commands:**

```bash
pnpm --filter shared exec tsc --noEmit
pnpm --filter miniapp exec tsc --noEmit
pnpm --filter miniapp build:weapp
pnpm --filter api exec tsc --noEmit
```

**Manual Checks:**
- 未登录进入客户/我的页面会跳登录。
- 登录后客户列表、客户详情、会员提交可用。
- 负责人能进入审批列表并填写实际收款日期。
- 分成列表能展示分页响应中的 `data`。

---

## 工程原则

- **KISS:** 只整理主流程，不引入新框架。
- **YAGNI:** 不做大面积视觉重构和非必要组件抽象。
- **SOLID:** 页面负责交互，service 负责契约，请求层负责错误与认证。
- **DRY:** 分页、DTO、登录守卫统一复用。
