import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import { membershipsApi, type MembershipRecord } from '../../services/memberships';
import { useAuthStore } from '../../store/auth';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '入会审批', REFUND_PENDING: '退款审批',
};

export default function ApprovalsPage() {
  const user = useAuthStore((s) => s.user);
  const [list, setList] = useState<MembershipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await membershipsApi.getPending();
      setList(data);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (user?.role === 'MEMBER') {
    return (
      <View className='page'>
        <View className='empty' style={{ paddingTop: '120rpx' }}>
          <Text>仅部门负责人可查看待办</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='page'>
      <ScrollView scrollY style={{ height: '100vh' }}>
        {loading ? (
          <View className='loading'>加载中…</View>
        ) : list.length === 0 ? (
          <View className='empty'>暂无待审批</View>
        ) : list.map((item) => (
          <View
            key={item.id}
            className='card'
            style={{ margin: '16rpx 24rpx', cursor: 'pointer' }}
            onClick={() => Taro.navigateTo({ url: `/pages/memberships/detail?id=${item.id}` })}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
              <Text style={{ fontSize: '30rpx', fontWeight: '600' }}>{item.customer?.name}</Text>
              <Text className='tag tag--pending'>{STATUS_LABELS[item.status] ?? item.status}</Text>
            </View>
            <Text style={{ fontSize: '26rpx', color: '#888', display: 'block' }}>
              {item.customer?.phone} · {item.submitter?.name}
            </Text>
            <Text style={{ fontSize: '28rpx', color: '#00a3a3', display: 'block', marginTop: '12rpx', fontWeight: '600' }}>
              ¥{Number(item.fee).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
