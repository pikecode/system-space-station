---
name: miniapp-visual-redesign
description: 客户资源管理小程序视觉改造方案 — 面向合伙人/代理商，升级为专业金融工具质感
metadata:
  type: project
---

# 小程序视觉改造设计规格

**项目:** 客户资源管理小程序  
**目标用户:** 合伙人 / 代理商（需要展示感强、彰显专业形象）  
**改造方向:** 深色 Header + 品牌渐变 Hero + 投影卡片体系  
**技术栈:** Taro + React + TypeScript  
**日期:** 2026-07-27

---

## 1. 问题诊断

| 问题 | 现状 | 改造方向 |
|------|------|---------|
| 样式全内联硬编码 | 满屏 `#00a3a3`、`fontSize: '28rpx'` | 建立 CSS token 体系 |
| 层次感不足 | 所有卡片等重，无投影，背景对比低 | 投影卡片 + 更深的 page 背景 |
| 品牌色稀释 | teal 分散用于所有元素 | 深色品牌只用在 Header/Hero，亮色用于 CTA |
| 数据展示平淡 | 金额与普通文字等级 | 金额大字 + 颜色强调 |
| 导航栏无品牌感 | 纯白 + 黑字 | 深色品牌色背景 + 白字 |

---

## 2. Design Token 体系

所有 token 集中定义在 `apps/miniapp/src/app.css`，消除所有 TSX 内联硬编码。

### 颜色

```css
:root {
  /* 品牌色 */
  --color-brand-dark:  #0a4f5e;  /* header / hero 背景 */
  --color-brand:       #007d7d;  /* 主操作按钮、强调色 */
  --color-brand-mid:   #006e6e;  /* 渐变中间色 */
  --color-brand-light: #e6f4f4;  /* tag 背景、浅色 tint */

  /* 页面层次 */
  --color-bg:          #f0f4f8;  /* page 背景 */
  --color-surface:     #ffffff;  /* 卡片 */
  --color-surface-2:   #f8fafc;  /* 次级信息块 */

  /* 文字 */
  --color-text-1:      #141921;  /* 主文字 */
  --color-text-2:      #5c6470;  /* 二级文字 / label */
  --color-text-3:      #9ea5b0;  /* placeholder / disabled */
  --color-text-inv:    #ffffff;  /* 深色背景上的文字 */

  /* 边框 & 分割线 */
  --color-border:      #e4eaf0;
  --color-divider:     #f0f3f7;

  /* 语义状态色 */
  --color-success:     #10b981;
  --color-warning:     #f59e0b;
  --color-error:       #ef4444;
  --color-info:        #3b82f6;
}
```

### 间距（4pt 网格，单位 rpx）

```css
:root {
  --space-2xs: 8rpx;
  --space-xs:  16rpx;
  --space-sm:  24rpx;
  --space-md:  32rpx;
  --space-lg:  48rpx;
  --space-xl:  64rpx;
}
```

### 圆角

```css
:root {
  --radius-sm:   8rpx;
  --radius-md:   16rpx;
  --radius-lg:   20rpx;
  --radius-pill: 999rpx;
}
```

### 投影

```css
:root {
  --shadow-card:  0 2rpx 20rpx rgba(0, 40, 60, 0.07);
  --shadow-float: 0 8rpx 32rpx rgba(0, 40, 60, 0.12);
}
```

### 渐变

```css
:root {
  --gradient-brand: linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%);
}
```

---

## 3. 全局修改

### 导航栏 (`app.config.ts`)

```ts
window: {
  navigationBarBackgroundColor: '#0a4f5e',
  navigationBarTextStyle: 'white',
  navigationBarTitleText: '客户资源管理',
}
```

单一改动，全局品牌感提升最显著。

### Tab Bar

```ts
tabBar: {
  color: '#9ea5b0',
  selectedColor: '#007d7d',
  backgroundColor: '#ffffff',
  borderStyle: 'white',
}
```

### page 背景色

```css
page {
  background-color: var(--color-bg); /* #f0f4f8 */
}
.page {
  background: var(--color-bg);
}
```

---

## 4. 全局组件规格

### 卡片 `.card`

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);  /* 20rpx */
  padding: var(--space-md);          /* 32rpx */
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-xs);   /* 16rpx */
}
```

### Section Title `.section-title`

```css
.section-title {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-3);
  text-transform: uppercase;
  padding: var(--space-md) var(--space-md) 12rpx;
}
```

### 标签 `.tag`（pill 化）

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: var(--radius-pill);
  font-size: 22rpx;
  font-weight: 500;
  background: var(--color-brand-light);
  color: var(--color-brand);
}
.tag--pending  { background: #fef3c7; color: #d97706; }
.tag--approved { background: #d1fae5; color: #059669; }
.tag--rejected { background: #fee2e2; color: #dc2626; }
.tag--expired  { background: #f1f5f9; color: #64748b; }
```

### 主按钮

```css
.btn--primary {
  height: 96rpx;
  border-radius: var(--radius-md);
  font-size: 30rpx;
  font-weight: 600;
  background: var(--gradient-brand);
  color: var(--color-text-inv);
}
```

### Row（详情页信息行）

```css
.row__label {
  font-size: 22rpx;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--color-text-2);
  width: 160rpx;
}
.row__value {
  font-size: 28rpx;
  color: var(--color-text-1);
}
```

### 头像圆圈 `.avatar`（新增）

```css
.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-pill);
  background: var(--gradient-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inv);
  font-size: 28rpx;
  font-weight: 700;
  flex-shrink: 0;
}
```

---

## 5. 逐页设计规格

### 5.1 客户列表 (`pages/customers/index`)

**搜索栏**
- 搜索框左侧加 SVG 搜索图标（Unicode `🔍` 或内联 SVG）
- 背景改 `var(--color-surface)`，外层加 `box-shadow: var(--shadow-card)`

**客户卡片结构变更**

现状（纯文字堆叠）→ 改为左头像 + 右内容的两列布局：

```
┌────────────────────────────────┐
│ [AV]  姓名               [企业] │
│       138xxxx8888              │
│       [转介绍] [VIP]            │
└────────────────────────────────┘
```

- `[AV]` = 客户姓名首字（或企业名第一字）头像圆圈，渐变背景
- 姓名 `font-size: 32rpx; font-weight: 700`
- 类型 tag 右对齐
- 电话 `font-size: 26rpx; color: var(--color-text-2)`
- 来源 + tags 以 pill 形展示

**空状态**
- 加内联 SVG 图标（人物轮廓）
- 文字 "暂无客户记录"，下方加"点击右上角新增"引导

### 5.2 客户详情 (`pages/customers/detail`)

**查看模式 — 顶部 Hero 卡**

在客户信息区域上方加渐变 Hero Banner（替换现有的普通白卡）：

```
┌─────────────────────────────────┐  ← background: var(--gradient-brand)
│                                 │
│  [头像 120rpx]  客户姓名 (36rpx 800)│
│                 个人客户  [tag]  │
│                 管理员录入        │
│                                 │
└─────────────────────────────────┘
```

- 渐变背景：`--gradient-brand`
- 所有文字 `color: var(--color-text-inv)`
- 头像：大号（120rpx），边框 `2rpx solid rgba(255,255,255,0.3)`
- 卡片 `border-radius: 0 0 32rpx 32rpx`（仅底部圆角，贴合导航栏）

**查看模式 — 信息 Section**

保持 row 布局，但提升 label 样式（见 4. 全局组件规格中的 row 规格）。

**编辑模式 — 表单字段**

```css
.field {
  background: var(--color-surface);
  padding: 24rpx var(--space-md);
  border-bottom: 1rpx solid var(--color-divider);
}
.field__label {
  font-size: 22rpx;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--color-text-2);
  margin-bottom: 10rpx;
}
.field__input {
  font-size: 30rpx;
  color: var(--color-text-1);
}
```

### 5.3 我的 (`pages/profile/index`)

**用户 Hero Banner**（替换现有普通白卡）

```
┌──────────────────────────────────┐  ← gradient-brand 背景
│         [头像 120rpx]             │
│         姓名  (40rpx weight-800)  │
│         系统管理员  (26rpx, 半透明) │
└──────────────────────────────────┘
```

- `border-radius: 0 0 40rpx 40rpx`
- 头像大圆圈白色边框 `4rpx solid rgba(255,255,255,0.5)`
- 占整个屏幕上方 1/3 视觉空间

**分享码模块**

```
我的分享码
┌──────────────────────────────────┐
│  A1B2C3               [复 制]    │
│  ──────────────────────────────  │
│  [分享给客户 — 渐变全宽按钮]        │
└──────────────────────────────────┘
```

- 分享码：`font-family: "Courier New", monospace; letter-spacing: 0.15em; font-size: 44rpx; font-weight: 700; color: var(--color-brand);`
- 分享按钮：渐变背景，高度 96rpx
- 复制按钮：outline 样式，`border: 2rpx solid var(--color-brand); color: var(--color-brand); border-radius: var(--radius-pill); padding: 8rpx 24rpx`

### 5.4 分成列表 (`pages/commissions/list`)

**顶部统计 Banner**

```
┌─────────────────────────────────────┐  ← gradient-brand
│   待结算              已结算          │
│   ¥12,800             ¥56,000        │
│   (f59e0b)            (10b981)       │
└─────────────────────────────────────┘
```

- Banner 内两列等分
- 标签：`font-size: 24rpx; color: rgba(255,255,255,0.7)`
- 金额：`font-size: 56rpx; font-weight: 800`，待结算用 `#f59e0b`，已结算用 `#10b981`
- `border-radius: 0 0 32rpx 32rpx`

**明细卡片**

```
┌──────────────────────────────────────┐
│ 张三                    [待结算]       │
│ 维护人  2026-01-15         ¥2,400     │
└──────────────────────────────────────┘
```

- 金额右对齐，`font-size: 34rpx; font-weight: 700`，正数 `var(--color-text-1)`，负数 `var(--color-error)`
- 日期 `font-size: 22rpx; color: var(--color-text-3)`

---

## 6. 实施范围说明

### 包含

- `apps/miniapp/src/app.css` — token 全面重写，组件类升级
- `apps/miniapp/src/app.config.ts` — 导航栏 / tabBar 颜色
- `apps/miniapp/src/pages/customers/index.tsx` — 列表卡片结构
- `apps/miniapp/src/pages/customers/detail.tsx` — Hero Banner + 信息区
- `apps/miniapp/src/pages/profile/index.tsx` — Hero Banner + 分享码模块
- `apps/miniapp/src/pages/commissions/list.tsx` — 统计 Banner + 明细卡片

### 不包含

- 业务逻辑（API 调用、状态管理不改动）
- `pages/login`、`pages/register`、`pages/memberships`（保留，可后续跟进）
- 导航图标替换（PNG 图标保留）

---

## 7. 质量验收标准

- [ ] app.css 中零硬编码 hex（所有颜色均通过 `var(--color-*)` 引用）
- [ ] 导航栏背景为品牌深色
- [ ] 客户列表卡片含头像圆圈
- [ ] 客户详情 / 我的 / 分成 页均有渐变 Hero Banner
- [ ] 分享码使用等宽字体
- [ ] 所有按钮高度统一为 96rpx
- [ ] 标签全部为 pill 形（border-radius: 999rpx）
