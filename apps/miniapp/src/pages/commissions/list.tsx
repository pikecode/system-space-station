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
