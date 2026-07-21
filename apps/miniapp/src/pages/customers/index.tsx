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
      <View style={{ background: '#fff', padding: '20rpx 32rpx', display: 'flex', gap: '16rpx' }}>
        <View style={{ flex: 1, background: '#f5f6f8', borderRadius: '10rpx', padding: '16rpx 24rpx', display: 'flex', alignItems: 'center' }}>
          <Input
            style={{ flex: 1, fontSize: '28rpx' }}
            placeholder='搜索客户姓名'
            value={search}
            onInput={(e) => setSearch(e.detail.value)}
            onConfirm={() => load(search)}
          />
        </View>
        <View
          style={{ background: '#00a3a3', color: '#fff', borderRadius: '10rpx', padding: '16rpx 28rpx', fontSize: '28rpx', display: 'flex', alignItems: 'center' }}
          onClick={() => Taro.navigateTo({ url: '/pages/customers/detail?mode=create' })}
        >
          新增
        </View>
      </View>

      {loading ? (
        <View className='loading'>加载中…</View>
      ) : list.length === 0 ? (
        <View className='empty'>暂无客户</View>
      ) : (
        <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
          {list.map((item) => (
            <View
              key={item.id}
              className='card'
              style={{ margin: '16rpx 24rpx', cursor: 'pointer' }}
              onClick={() => Taro.navigateTo({ url: `/pages/customers/detail?id=${item.id}` })}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12rpx' }}>
                <Text style={{ fontSize: '32rpx', fontWeight: '600' }}>{item.name}</Text>
                <Text className={`tag ${item.customerType === 'COMPANY' ? 'tag--pending' : ''}`}>
                  {item.customerType === 'INDIVIDUAL' ? '个人' : '企业'}
                </Text>
              </View>
              <Text style={{ fontSize: '26rpx', color: '#888', display: 'block' }}>{item.phone}</Text>
              <View style={{ marginTop: '12rpx', display: 'flex', gap: '12rpx' }}>
                <Text className='tag'>{SOURCE_LABELS[item.source] ?? item.source}</Text>
                {item.tags?.split(',').map((t) => (
                  <Text key={t} className='tag'>{t}</Text>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
