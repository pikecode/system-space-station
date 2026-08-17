# 组织规则收口与快照补强 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将部门层级、容量等组织规则收口为共享定义，并补齐会员申请在提交和审批时的组织归属快照。

**Architecture:** 保持现有 NestJS + Prisma + React monorepo。新增 `packages/shared` 组织规则作为前后端单一事实源；后端仍在 service 层强制不变量，前端只负责展示和表单限制；会员快照落在 `Membership` 表，分成记录继续保留审批时部门快照。

**Tech Stack:** TypeScript、NestJS、Prisma、React、Vitest。

---

### Task 1: 共享组织规则

**Files:**
- Create: `packages/shared/src/organization-rules.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `apps/web/src/pages/admin/departments/DepartmentsPage.tsx`
- Modify: `apps/web/src/pages/admin/users/UsersPage.tsx`
- Modify: `apps/api/src/modules/departments/departments.service.ts`
- Modify: `apps/api/src/modules/users/users.service.ts`

**Steps:**
1. 新增部门类型标签、父子层级规则、容量规则、市场部最大数量常量。
2. 前端部门页和用户页删除本地重复常量，统一从 `shared` 导入。
3. 后端部门服务使用共享父子规则和市场部数量规则。
4. 后端用户服务使用共享容量规则，并在创建、调岗、启用时校验。

### Task 2: 会员组织快照

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260817104000_membership_org_snapshots/migration.sql`
- Modify: `apps/api/src/modules/memberships/memberships.service.ts`

**Steps:**
1. 在 `Membership` 增加 `submittedDepartmentId`、`submittedAssignedTo`、`approvedDepartmentId`、`approvedAssignedTo`。
2. 创建会员申请和重新提交时写入提交快照。
3. 审批通过时写入审批快照。

### Task 3: 回归测试

**Files:**
- Modify: `apps/api/src/modules/departments/departments.service.spec.ts`
- Modify: `apps/api/src/modules/users/users.service.spec.ts`
- Modify: `apps/api/src/modules/memberships/memberships.service.spec.ts`

**Steps:**
1. 覆盖市场部最大数量校验。
2. 覆盖调岗进入满员部门被拒绝。
3. 覆盖会员提交和审批写入组织快照。
4. 运行 `pnpm --filter api test`、`pnpm type-check`。
