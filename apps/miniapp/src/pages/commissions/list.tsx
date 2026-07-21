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
      <View style={{ display: 'flex', gap: '16rpx', padding: '24rpx' }}>
        <View className='card' style={{ flex: 1, margin: 0, textAlign: 'center' }}>
          <Text style={{ fontSize: '24rpx', color: '#888', display: 'block' }}>待结算</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#fa8c16', display: 'block', marginTop: '8rpx' }}>
            ¥{totalPending.toLocaleString()}
          </Text>
        </View>
        <View className='card' style={{ flex: 1, margin: 0, textAlign: 'center' }}>
          <Text style={{ fontSize: '24rpx', color: '#888', display: 'block' }}>已结算</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#52c41a', display: 'block', marginTop: '8rpx' }}>
            ¥{totalSettled.toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
        {loading ? (
          <View className='loading'>加载中…</View>
        ) : list.length === 0 ? (
          <View className='empty'>暂无分成记录</View>
        ) : list.map((item) => (
          <View key={item.id} className='card' style={{ margin: '0 24rpx 16rpx' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
              <Text style={{ fontWeight: '600' }}>{item.membership?.customer?.name ?? '—'}</Text>
              <Text className={`tag ${STATUS_CLASS[item.status] ?? ''}`}>{STATUS_LABELS[item.status] ?? item.status}</Text>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: '26rpx', color: '#888' }}>{ROLE_LABELS[item.receiverRole] ?? item.receiverRole}</Text>
              <Text style={{ fontSize: '32rpx', fontWeight: '700', color: Number(item.amount) < 0 ? '#f5222d' : '#1a1d21' }}>
                ¥{Number(item.amount).toLocaleString()}
              </Text>
            </View>
            <Text style={{ fontSize: '22rpx', color: '#bbb', display: 'block', marginTop: '8rpx' }}>
              {item.createdAt?.slice(0, 10)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
