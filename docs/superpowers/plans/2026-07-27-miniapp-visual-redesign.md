# 小程序视觉改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将客户资源管理小程序从"功能性原型"升级为面向合伙人/代理商的专业视觉风格，采用深色品牌 Header + 渐变 Hero Banner + 投影卡片体系。

**Architecture:** 纯视觉/样式层改造，不涉及任何业务逻辑。所有颜色从内联硬编码迁移到 `app.css` CSS 变量体系，各页面通过 `var(--token)` 引用。六个文件按顺序改造，每个文件独立可验证。

**Tech Stack:** Taro 4.2.1 + React 18 + TypeScript 5.4，构建目标微信小程序（weapp）

## Global Constraints

- 构建命令：`pnpm --filter miniapp build:weapp`
- 所有颜色必须通过 `var(--color-*)` 引用，app.css 内零硬编码 hex
- 品牌渐变：`linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)`（所有 Hero/Banner 统一）
- 所有主按钮高度 96rpx，border-radius: var(--radius-md)
- 标签（tag）全部改为 pill 形：border-radius: var(--radius-pill)
- 不修改任何业务逻辑、API 调用、状态管理代码

---

### Task 1: Design Token 体系 + 全局组件

**Files:**
- Modify: `apps/miniapp/src/app.css`

**Interfaces:**
- Produces: CSS 变量供所有后续 task 使用的完整 token 集合

- [ ] **Step 1: 完整替换 `apps/miniapp/src/app.css`**

```css
page {
  --color-brand-dark:  #0a4f5e;
  --color-brand:       #007d7d;
  --color-brand-light: #e6f4f4;
  --color-bg:          #f0f4f8;
  --color-surface:     #ffffff;
  --color-surface-2:   #f8fafc;
  --color-text-1:      #141921;
  --color-text-2:      #5c6470;
  --color-text-3:      #9ea5b0;
  --color-text-inv:    #ffffff;
  --color-border:      #e4eaf0;
  --color-divider:     #f0f3f7;
  --color-success:     #10b981;
  --color-warning:     #f59e0b;
  --color-error:       #ef4444;
  --space-2xs: 8rpx;
  --space-xs:  16rpx;
  --space-sm:  24rpx;
  --space-md:  32rpx;
  --space-lg:  48rpx;
  --space-xl:  64rpx;
  --radius-sm:   8rpx;
  --radius-md:   16rpx;
  --radius-lg:   20rpx;
  --radius-pill: 999rpx;
  --shadow-card:  0 2rpx 20rpx rgba(0, 40, 60, 0.07);
  --shadow-float: 0 8rpx 32rpx rgba(0, 40, 60, 0.12);
  background-color: var(--color-bg);
  color: var(--color-text-1);
  font-family: -apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif;
  font-size: 28rpx;
  line-height: 1.5;
}
.page { min-height: 100vh; background: var(--color-bg); }
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-xs);
}
.row { display: flex; align-items: center; padding: var(--space-sm) 0; border-bottom: 1rpx solid var(--color-divider); }
.row:last-child { border-bottom: none; }
.row__label { font-size: 22rpx; font-weight: 500; letter-spacing: 0.05em; color: var(--color-text-2); width: 160rpx; flex-shrink: 0; }
.row__value { flex: 1; font-size: 28rpx; color: var(--color-text-1); }
.tag { display: inline-flex; align-items: center; padding: 4rpx 16rpx; border-radius: var(--radius-pill); font-size: 22rpx; font-weight: 500; background: var(--color-brand-light); color: var(--color-brand); }
.tag--pending  { background: #fef3c7; color: #d97706; }
.tag--approved { background: #d1fae5; color: #059669; }
.tag--rejected { background: #fee2e2; color: #dc2626; }
.tag--expired  { background: #f1f5f9; color: #64748b; }
.btn { display: flex; align-items: center; justify-content: center; height: 96rpx; border-radius: var(--radius-md); font-size: 30rpx; font-weight: 600; border: none; }
.btn--primary { background: linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%); color: var(--color-text-inv); }
.btn--danger  { background: var(--color-error); color: var(--color-text-inv); }
.btn--outline { background: transparent; border: 2rpx solid var(--color-brand); color: var(--color-brand); }
.btn--ghost   { background: var(--color-surface-2); color: var(--color-text-2); }
.field { background: var(--color-surface); padding: 24rpx var(--space-md); border-bottom: 1rpx solid var(--color-divider); }
.field__label { font-size: 22rpx; font-weight: 500; letter-spacing: 0.05em; color: var(--color-text-2); margin-bottom: 10rpx; display: block; }
.field__input { width: 100%; font-size: 30rpx; color: var(--color-text-1); border: none; outline: none; background: transparent; }
.section-title { font-size: 22rpx; font-weight: 600; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-md) var(--space-md) 12rpx; text-transform: uppercase; }
.avatar { width: 72rpx; height: 72rpx; border-radius: var(--radius-pill); background: linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%); display: flex; align-items: center; justify-content: center; color: var(--color-text-inv); font-size: 28rpx; font-weight: 700; flex-shrink: 0; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80rpx 0; color: var(--color-text-3); font-size: 26rpx; gap: 16rpx; }
.loading { display: flex; align-items: center; justify-content: center; padding: 60rpx 0; color: var(--color-text-3); font-size: 26rpx; }
.amount--positive { color: var(--color-success); }
.amount--negative { color: var(--color-error); }
.amount--pending  { color: var(--color-warning); }
```

- [ ] **Step 2: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

期望：构建成功，无 TypeScript 或 CSS 错误。

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/app.css
git commit -m "style: 建立 design token 体系，升级全局组件类"
```

---

### Task 2: 全局导航配置

**Files:**
- Modify: `apps/miniapp/src/app.config.ts`

**Interfaces:**
- Consumes: 无
- Produces: 深色品牌导航栏供所有页面使用

- [ ] **Step 1: 修改 `apps/miniapp/src/app.config.ts` 的 window 和 tabBar**

```typescript
export default {
  pages: [
    'pages/login/index',
    'pages/register/index',
    'pages/register/success',
    'pages/customers/index',
    'pages/customers/detail',
    'pages/profile/index',
    'pages/memberships/create',
    'pages/memberships/detail',
    'pages/commissions/list',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0a4f5e',
    navigationBarTitleText: '客户资源管理',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#9ea5b0',
    selectedColor: '#007d7d',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/customers/index',
        text: '客户',
        iconPath: 'assets/icons/customers.png',
        selectedIconPath: 'assets/icons/customers-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
      },
    ],
  },
};
```

- [ ] **Step 2: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/app.config.ts
git commit -m "style: 导航栏改为品牌深色，tab bar 颜色更新"
```

---

### Task 3: 客户列表卡片重构

**Files:**
- Modify: `apps/miniapp/src/pages/customers/index.tsx`

**Interfaces:**
- Consumes: `.card`、`.avatar`、`.tag`、`.empty`、`.loading` 来自 Task 1
- Produces: 带头像圆圈的双列卡片布局

- [ ] **Step 1: 完整替换 `apps/miniapp/src/pages/customers/index.tsx`**

```tsx
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { customersApi, type CustomerRow } from '../../services/customers';
import { useAuthStore } from '../../store/auth';

export default function CustomersPage() {
  const user = useAuthStore((s) => s.user);
  const [list, setList] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (name?: string) => {
    setLoading(true);
    try {
      const data = await customersApi.getAll(name ? { name } : undefined);
      setList(data);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const SOURCE_LABELS: Record<string, string> = {
    REFERRAL: '转介绍', SELF_DEVELOPED: '自主开发',
    ACTIVITY: '活动', ONLINE: '线上', OTHER: '其他',
  };

  return (
    <View className='page'>
      <View style={{ background: 'var(--color-surface)', padding: 'var(--space-sm) var(--space-md)', display: 'flex', gap: 'var(--space-xs)', boxShadow: 'var(--shadow-card)' }}>
        <View style={{ flex: 1, background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: '16rpx 24rpx', display: 'flex', alignItems: 'center', gap: '12rpx' }}>
          <Text style={{ fontSize: '28rpx', color: 'var(--color-text-3)' }}>🔍</Text>
          <Input
            style={{ flex: 1, fontSize: '28rpx', color: 'var(--color-text-1)' }}
            placeholder='搜索客户姓名'
            placeholderStyle='color: #9ea5b0'
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
            onConfirm={() => load(search)}
          />
        </View>
        <View
          style={{ background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: '#fff', borderRadius: 'var(--radius-md)', padding: '0 28rpx', fontSize: '28rpx', fontWeight: '600', display: 'flex', alignItems: 'center' }}
          onClick={() => Taro.navigateTo({ url: '/pages/customers/detail?mode=create' })}
        >
          新增
        </View>
      </View>

      {loading ? (
        <View className='loading'>加载中…</View>
      ) : list.length === 0 ? (
        <View className='empty'>
          <Text>暂无客户记录</Text>
          <Text style={{ fontSize: '24rpx' }}>点击右上角新增第一位客户</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
          <View style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {list.map((item) => (
              <View
                key={item.id}
                className='card'
                style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', cursor: 'pointer' }}
                onClick={() => Taro.navigateTo({ url: `/pages/customers/detail?id=${item.id}` })}
              >
                <View className='avatar'>
                  <Text style={{ color: '#fff', fontSize: '28rpx', fontWeight: '700' }}>
                    {item.name?.[0] ?? '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8rpx' }}>
                    <Text style={{ fontSize: '32rpx', fontWeight: '700', color: 'var(--color-text-1)' }}>{item.name}</Text>
                    <Text className={`tag ${item.customerType === 'COMPANY' ? 'tag--pending' : ''}`}>
                      {item.customerType === 'INDIVIDUAL' ? '个人' : '企业'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: '26rpx', color: 'var(--color-text-2)', display: 'block', marginBottom: '12rpx' }}>{item.phone}</Text>
                  <View style={{ display: 'flex', gap: '8rpx', flexWrap: 'wrap' }}>
                    <Text className='tag'>{SOURCE_LABELS[item.source] ?? item.source}</Text>
                    {item.tags?.split(',').filter(Boolean).map((t) => (
                      <Text key={t} className='tag'>{t.trim()}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
```

- [ ] **Step 2: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/pages/customers/index.tsx
git commit -m "style: 客户列表卡片加头像圆圈，搜索栏品牌化"
```

---

### Task 4: 客户详情 Hero Banner

**Files:**
- Modify: `apps/miniapp/src/pages/customers/detail.tsx`

**Interfaces:**
- Consumes: `.card`、`.row`、`.row__label`、`.row__value`、`.tag`、`.field`、`.section-title` 来自 Task 1
- Produces: 渐变 Hero Banner 取代原顶部白卡

- [ ] **Step 1: 替换查看模式顶部 Hero 卡（detail.tsx 第 249-261 行附近）**

找到 `{/* 头部 */}` 注释块，将其替换为：

```tsx
{/* Hero Banner */}
<View style={{
  background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)',
  borderRadius: '0 0 32rpx 32rpx',
  padding: '32rpx 32rpx 40rpx',
  display: 'flex',
  alignItems: 'center',
  gap: '24rpx',
}}>
  <View style={{
    width: '120rpx', height: '120rpx', borderRadius: '999rpx',
    background: 'rgba(255,255,255,0.2)',
    border: '4rpx solid rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <Text style={{ color: '#fff', fontSize: '48rpx', fontWeight: '800' }}>
      {customer?.name?.[0] ?? '?'}
    </Text>
  </View>
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: '40rpx', fontWeight: '800', color: '#fff', display: 'block' }}>
      {customer?.name}
    </Text>
    <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx' }}>
      <View style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999rpx', padding: '4rpx 16rpx' }}>
        <Text style={{ color: '#fff', fontSize: '22rpx', fontWeight: '500' }}>
          {customer?.customerType === 'INDIVIDUAL' ? '个人客户' : '企业客户'}
        </Text>
      </View>
      {customer?.registrationSource && (
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22rpx' }}>
          {REG_SOURCE_LABELS[customer.registrationSource] ?? customer.registrationSource}
        </Text>
      )}
    </View>
  </View>
</View>
```

- [ ] **Step 2: 更新底部按钮 bar 的内联颜色引用**

找到文件底部 `position: 'fixed'` 的 View，将所有硬编码颜色替换为 token：

```tsx
<View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', padding: 'var(--space-sm) var(--space-md)', borderTop: '1rpx solid var(--color-divider)', display: 'flex', gap: 'var(--space-xs)' }}>
  {editing ? (
    <View style={{ display: 'flex', flex: 1, gap: 'var(--space-xs)' }}>
      {!isCreate && (
        <Button style={{ flex: 1, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} onClick={() => setEditing(false)}>取消</Button>
      )}
      <Button style={{ flex: 2, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: '#fff', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} loading={saving} onClick={handleSave}>保存</Button>
    </View>
  ) : (
    <Button style={{ flex: 1, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: '#fff', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} onClick={() => setEditing(true)}>编辑</Button>
  )}
</View>
```

- [ ] **Step 3: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/pages/customers/detail.tsx
git commit -m "style: 客户详情顶部改为渐变 Hero Banner，按钮品牌化"
```

---

### Task 5: 我的页面 Hero Banner + 分享码

**Files:**
- Modify: `apps/miniapp/src/pages/profile/index.tsx`

**Interfaces:**
- Consumes: `.section-title`、`.row` 来自 Task 1
- Produces: 渐变居中 Hero Banner + 等宽字体分享码

- [ ] **Step 1: 完整替换 `apps/miniapp/src/pages/profile/index.tsx`**

```tsx
import { useEffect } from 'react';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../services/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员', HEAD: '部门负责人', MEMBER: '部门成员',
};

export default function ProfilePage() {
  const { user, logout, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    authApi.me().then((me) => {
      if (me && token) setAuth(token, me as any);
    }).catch(() => {});
  }, []);

  useShareAppMessage(() => ({
    title: `${user?.name ?? ''} 邀请您登记信息`,
    path: `/pages/register/index?shareCode=${user?.shareCode ?? ''}`,
  }));

  const handleCopyCode = () => {
    if (!user?.shareCode) return;
    Taro.setClipboardData({ data: user.shareCode });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确认退出？',
      success: ({ confirm }) => {
        if (confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  return (
    <View className='page'>
      {/* Hero Banner */}
      <View style={{
        background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)',
        borderRadius: '0 0 40rpx 40rpx',
        padding: '48rpx 32rpx 56rpx',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20rpx',
      }}>
        <View style={{
          width: '120rpx', height: '120rpx', borderRadius: '999rpx',
          background: 'rgba(255,255,255,0.2)',
          border: '4rpx solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: '48rpx', fontWeight: '800' }}>
            {user?.name?.[0] ?? '?'}
          </Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '40rpx', fontWeight: '800', color: '#fff', display: 'block' }}>{user?.name}</Text>
          <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '8rpx' }}>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
          </Text>
        </View>
      </View>

      {/* 分享邀请 */}
      {user?.shareCode && (
        <>
          <View className='section-title'>邀请客户</View>
          <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', margin: '0 var(--space-md)', padding: '28rpx 32rpx', boxShadow: 'var(--shadow-card)' }}>
            <View style={{ display: 'flex', alignItems: 'center', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '28rpx', color: 'var(--color-text-2)', flex: 1 }}>我的分享码</Text>
              <Text style={{ fontFamily: '"Courier New", "SF Mono", monospace', fontSize: '40rpx', fontWeight: '700', color: 'var(--color-brand)', letterSpacing: '0.15em', marginRight: '16rpx' }}>
                {user.shareCode}
              </Text>
              <Text
                style={{ fontSize: '24rpx', color: 'var(--color-brand)', border: '2rpx solid var(--color-brand)', padding: '8rpx 20rpx', borderRadius: 'var(--radius-pill)' }}
                onClick={handleCopyCode}
              >
                复制
              </Text>
            </View>
            <Button
              style={{ background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: '30rpx', fontWeight: '600', height: '96rpx' }}
              openType='share'
            >
              分享给客户
            </Button>
          </View>
        </>
      )}

      {/* 功能 */}
      <View className='section-title'>功能</View>
      <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', margin: '0 var(--space-md)', boxShadow: 'var(--shadow-card)' }}>
        <View
          className='row'
          style={{ padding: '28rpx 32rpx', cursor: 'pointer' }}
          onClick={() => Taro.navigateTo({ url: '/pages/commissions/list' })}
        >
          <Text style={{ fontSize: '30rpx', flex: 1, color: 'var(--color-text-1)' }}>我的分成</Text>
          <Text style={{ color: 'var(--color-text-3)', fontSize: '24rpx' }}>›</Text>
        </View>
      </View>

      <View style={{ padding: '48rpx var(--space-md) 0' }}>
        <Button
          style={{ background: 'var(--color-surface)', color: 'var(--color-error)', border: '2rpx solid var(--color-error)', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/pages/profile/index.tsx
git commit -m "style: 我的页面改为渐变居中 Hero Banner，分享码等宽字体"
```

---

### Task 6: 分成列表 统计 Banner + 明细卡片

**Files:**
- Modify: `apps/miniapp/src/pages/commissions/list.tsx`

**Interfaces:**
- Consumes: `.card`、`.tag`、`.loading`、`.empty` 来自 Task 1
- Produces: 渐变统计 Banner + 金额大字明细卡片

- [ ] **Step 1: 完整替换 `apps/miniapp/src/pages/commissions/list.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { commissionsApi, type CommissionRecord } from '../../services/commissions';
import { useAuthStore } from '../../store/auth';

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '维护人', DEPT_HEAD: '部门负责人',
  MARKET_HEAD: '市场部负责人', COMPANY: '公司',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: '待结算', PENDING_PAYMENT: '待出账', SETTLED: '已结算',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending', PENDING_PAYMENT: 'tag--pending', SETTLED: 'tag--approved',
};

export default function CommissionsListPage() {
  const user = useAuthStore((s) => s.user);
  const [list, setList] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = user?.role === 'HEAD'
      ? commissionsApi.getDepartment()
      : commissionsApi.getMy();
    fetch.then(setList).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPending = list
    .filter((r) => r.status === 'PENDING' && r.entryType === 'EARNING')
    .reduce((s, r) => s + Number(r.amount), 0);
  const totalSettled = list
    .filter((r) => r.status === 'SETTLED' && r.entryType === 'EARNING')
    .reduce((s, r) => s + Number(r.amount), 0);

  return (
    <View className='page'>
      {/* 统计 Banner */}
      <View style={{
        background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)',
        borderRadius: '0 0 32rpx 32rpx',
        padding: '32rpx 24rpx 40rpx',
        display: 'flex',
        gap: '16rpx',
      }}>
        <View style={{ flex: 1, textAlign: 'center' }}>
          <Text style={{ fontSize: '24rpx', color: 'rgba(255,255,255,0.7)', display: 'block' }}>待结算</Text>
          <Text style={{ fontSize: '56rpx', fontWeight: '800', color: '#f59e0b', display: 'block', marginTop: '8rpx' }}>
            ¥{totalPending.toLocaleString()}
          </Text>
        </View>
        <View style={{ width: '1rpx', background: 'rgba(255,255,255,0.2)', margin: '8rpx 0' }} />
        <View style={{ flex: 1, textAlign: 'center' }}>
          <Text style={{ fontSize: '24rpx', color: 'rgba(255,255,255,0.7)', display: 'block' }}>已结算</Text>
          <Text style={{ fontSize: '56rpx', fontWeight: '800', color: '#10b981', display: 'block', marginTop: '8rpx' }}>
            ¥{totalSettled.toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
        {loading ? (
          <View className='loading'>加载中…</View>
        ) : list.length === 0 ? (
          <View className='empty'>暂无分成记录</View>
        ) : (
          <View style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {list.map((item) => (
              <View key={item.id} className='card' style={{ margin: 0 }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12rpx' }}>
                  <Text style={{ fontWeight: '700', fontSize: '30rpx', color: 'var(--color-text-1)' }}>
                    {item.membership?.customer?.name ?? '—'}
                  </Text>
                  <Text className={`tag ${STATUS_CLASS[item.status] ?? ''}`}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ fontSize: '26rpx', color: 'var(--color-text-2)', display: 'block' }}>
                      {ROLE_LABELS[item.receiverRole] ?? item.receiverRole}
                    </Text>
                    <Text style={{ fontSize: '22rpx', color: 'var(--color-text-3)', display: 'block', marginTop: '4rpx' }}>
                      {item.createdAt?.slice(0, 10)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: '40rpx', fontWeight: '800', color: Number(item.amount) < 0 ? 'var(--color-error)' : 'var(--color-text-1)' }}>
                    ¥{Number(item.amount).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: 构建验证**

```bash
pnpm --filter miniapp build:weapp
```

- [ ] **Step 3: Commit**

```bash
git add apps/miniapp/src/pages/commissions/list.tsx
git commit -m "style: 分成列表改为渐变统计 Banner，金额大字显示"
```

---

## 验收检查清单

改造完成后，在微信开发者工具逐页确认：

- [ ] 导航栏背景为深色品牌色（`#0a4f5e`），文字为白色
- [ ] Tab Bar 选中色为 `#007d7d`，未选中为灰色
- [ ] 客户列表：每个卡片左侧有渐变头像圆圈，搜索栏有🔍图标
- [ ] 客户详情（查看模式）：顶部为渐变 Hero Banner，含大头像和白色文字
- [ ] 我的：顶部为渐变居中 Hero Banner，分享码为等宽字体大号显示
- [ ] 分成列表：顶部为渐变 Banner，待结算黄色大字，已结算绿色大字
- [ ] 所有标签（tag）为 pill 形圆角
- [ ] 所有主按钮高度统一，使用渐变背景
- [ ] `app.css` 中零硬编码 hex（通过搜索 `#[0-9a-fA-F]` 验证）

