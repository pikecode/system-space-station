import { useState } from 'react';
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { customersApi, type CustomerRow } from '../../services/customers';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL: '转介绍',
  SELF_DEVELOPED: '自主开发',
  ACTIVITY: '活动获客',
  ONLINE: '线上渠道',
  OTHER: '其他',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '有效',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending',
  APPROVED: 'tag--approved',
  REJECTED: 'tag--rejected',
  EXPIRED: 'tag--expired',
};

const FILTERS = [
  { label: '全部', value: 'ALL' },
  { label: '个人', value: 'INDIVIDUAL' },
  { label: '企业', value: 'COMPANY' },
] as const;

type FilterValue = typeof FILTERS[number]['value'];

interface Stats { total: number; approved: number; pending: number }

export default function CustomersPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();
  const [list, setList] = useState<CustomerRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [loading, setLoading] = useState(true);

  const load = async (name?: string) => {
    setLoading(true);
    try {
      // CustomerStatus 只有 ACTIVE / INACTIVE，没有 APPROVED/PENDING
      // 有效客户 = ACTIVE，非活跃 = INACTIVE，前端 list 的 status label 是会员状态
      const [all, inactive] = await Promise.all([
        customersApi.getAll(name ? { name } : undefined),
        customersApi.getAll({ status: 'INACTIVE' as any, ...(name ? { name } : {}) }),
      ]);
      setList(all.data);
      setStats({
        total: all.total,
        approved: all.total - inactive.total,
        pending: inactive.total,
      });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => { if (authorized && token) load(search.trim() || undefined); });

  // 分享给朋友：带分享码
  useShareAppMessage(() => ({
    title: '欢迎登记客户信息',
    path: '/pages/customers/index',
  }));

  // 分享到朋友圈
  useShareTimeline(() => ({
    title: '客户资源管理 · 高效跟进每一位客户',
  }));
  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  const visibleList = filter === 'ALL'
    ? list
    : list.filter((item) => item.customerType === filter);
  const writable = user?.canWriteCustomer === true;

  return (
    <View className='page'>
      {/* 统计看板 */}
      <View className='summary-band'>
        <View className='metric'>
          <Text className='metric__label'>全部客户</Text>
          <Text className='metric__value'>{stats.total}</Text>
        </View>
        <View className='metric'>
          <Text className='metric__label'>活跃客户</Text>
          <Text className='metric__value'>{stats.approved}</Text>
        </View>
        <View className='metric'>
          <Text className='metric__label'>非活跃</Text>
          <Text className={`metric__value ${stats.pending > 0 ? 'metric__value--warning' : ''}`}>
            {stats.pending}
          </Text>
        </View>
      </View>

      <View className='toolbar'>
        <View className='search-box'>
          <Input
            className='search-box__input'
            placeholder='搜索姓名或企业名称'
            placeholderStyle='color:#89928f'
            confirmType='search'
            value={search}
            onInput={(e) => {
              const value = e.detail.value;
              setSearch(value);
              if (!value) load();
            }}
            onConfirm={() => load(search.trim() || undefined)}
          />
        </View>
        {writable && (
          <View
            className='icon-button'
            aria-label='新增客户'
            onClick={() => Taro.navigateTo({ url: '/pages/customers/detail?mode=create' })}
          >
            +
          </View>
        )}
      </View>

      <View className='segmented'>
        {FILTERS.map((item) => (
          <View
            key={item.value}
            className={`segmented__item ${filter === item.value ? 'segmented__item--active' : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </View>
        ))}
      </View>

      <View className='content-meta'>
        <Text>客户列表</Text>
        <Text><Text className='content-meta__strong'>{visibleList.length}</Text> 位客户</Text>
      </View>

      {loading ? (
        <View className='status-panel'>
          <View className='status-panel__mark'>...</View>
          <Text className='status-panel__title'>正在加载客户</Text>
        </View>
      ) : visibleList.length === 0 ? (
        <View className='status-panel'>
          <View className='status-panel__mark'>+</View>
          <Text className='status-panel__title'>{search ? '没有匹配的客户' : '暂无客户记录'}</Text>
          <Text className='status-panel__desc'>{search ? '调整搜索内容后重试' : writable ? '使用右上角新增客户' : '当前账号仅可查看客户'}</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
          <View className='entity-list'>
            {visibleList.map((item) => (
              <View
                key={item.id}
                className='entity-row'
                onClick={() => Taro.navigateTo({ url: `/pages/customers/detail?id=${item.id}` })}
              >
                <View className='avatar'>{item.name?.[0] ?? '?'}</View>
                <View className='entity-row__body'>
                  <View className='entity-row__top'>
                    <Text className='entity-row__title'>{item.name}</Text>
                    <Text className={`tag ${STATUS_CLASS[item.status] ?? 'tag--neutral'}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Text>
                  </View>
                  <View className='entity-row__bottom'>
                    <Text className='entity-row__meta'>
                      {item.phone} · {SOURCE_LABELS[item.source] ?? item.source}
                    </Text>
                    <Text className='tag tag--neutral'>
                      {item.customerType === 'INDIVIDUAL' ? '个人' : '企业'}
                    </Text>
                  </View>
                </View>
                <Text className='entity-row__arrow'>›</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
