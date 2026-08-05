# 小程序专业 CRM 视觉优化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有 Taro 小程序统一为专业 CRM 视觉，并完善高频列表、表单和状态反馈。

**Architecture:** 以全局设计令牌和语义化公共样式为基础，页面组件仅负责业务结构和状态。按核心客户流程、业务流程、个人与公开登记页面分批改造，保持接口与数据流不变。

**Tech Stack:** Taro 4、React 18、TypeScript、微信小程序组件、CSS

---

### Task 1: 建立视觉基础

**Files:**
- Modify: `apps/miniapp/src/app.css`
- Modify: `apps/miniapp/src/app.config.ts`
- Modify: `apps/miniapp/src/pages/login/index.tsx`
- Modify: `apps/miniapp/src/pages/login/index.css`

**Steps:**
1. 统一颜色、排版、间距、圆角、边框、按钮、状态标签和反馈状态。
2. 增加页面框架、工具栏、列表行、表单面板和底部操作栏公共类。
3. 重构登录页结构并增加表单内网络错误提示。
4. 运行 `pnpm --filter miniapp exec tsc --noEmit`，预期无错误。

### Task 2: 优化客户核心流程

**Files:**
- Modify: `apps/miniapp/src/pages/customers/index.tsx`
- Modify: `apps/miniapp/src/pages/customers/detail.tsx`

**Steps:**
1. 将客户首页重构为固定搜索工具栏、结果摘要和连续客户列表。
2. 将详情页重构为身份摘要、分组信息、分段编辑与统一底部操作。
3. 保留新增、搜索、编辑和提交会员的原业务行为。
4. 运行 TypeScript 检查，预期无错误。

### Task 3: 优化业务工作流页面

**Files:**
- Modify: `apps/miniapp/src/pages/approvals/index.tsx`
- Modify: `apps/miniapp/src/pages/commissions/list.tsx`
- Modify: `apps/miniapp/src/pages/memberships/create.tsx`
- Modify: `apps/miniapp/src/pages/memberships/detail.tsx`

**Steps:**
1. 待办页面突出类型、客户、提交人和金额。
2. 分成页面使用紧凑汇总带和可扫描明细行。
3. 会员创建与详情统一客户上下文、字段分组和审批操作。
4. 运行 TypeScript 检查，预期无错误。

### Task 4: 优化个人中心与公开登记

**Files:**
- Modify: `apps/miniapp/src/pages/profile/index.tsx`
- Modify: `apps/miniapp/src/pages/register/index.tsx`
- Modify: `apps/miniapp/src/pages/register/success.tsx`

**Steps:**
1. 个人中心改为紧凑身份摘要、邀请工具和标准功能列表。
2. 海报视觉同步新的品牌颜色和排版。
3. 公开登记页复用表单与分段控件，成功页提供明确完成状态。
4. 运行 TypeScript 检查，预期无错误。

### Task 5: 构建与视觉验证

**Files:**
- Verify: `apps/miniapp/src/**`

**Steps:**
1. 运行 `pnpm --filter miniapp exec tsc --noEmit`。
2. 运行 `TARO_DEBUG=true pnpm --filter miniapp exec taro build --type weapp`。
3. 构建 H5 预览并检查桌面、手机视口截图。
4. 检查文本溢出、固定操作栏遮挡、按钮状态与空状态。
5. 运行 `git diff --check`，确认无空白符错误。
