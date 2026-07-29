import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { customersApi, type CustomerRow } from '../../services/customers';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

export default function CustomersPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const authorized = useRequireLogin();
  const [list, setList] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (name?: string) => {
    setLoading(true);
    try {
      const page = await customersApi.getAll(name ? { name } : undefined);
      setList(page.data);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => { if (authorized && token) load(); });

  if (!authorized) return <View className='page' />;

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
            placeholderStyle='color: var(--color-text-3)'
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
            onConfirm={() => load(search)}
          />
        </View>
        <View
          style={{ background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', padding: '0 28rpx', fontSize: '28rpx', fontWeight: '600', display: 'flex', alignItems: 'center' }}
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
                  <Text style={{ color: 'var(--color-text-inv)', fontSize: '28rpx', fontWeight: '700' }}>
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
