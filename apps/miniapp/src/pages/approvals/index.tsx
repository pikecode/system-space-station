import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { membershipsApi, type MembershipRecord } from '../../services/memberships';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '入会审批',
  REFUND_PENDING: '退款审批',
};

export default function ApprovalsPage() {
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();
  const [list, setList] = useState<MembershipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const canReviewApprovals = user?.canWriteCustomer === true && (user?.role === 'HEAD' || user?.role === 'ADMIN');

  const load = async () => {
    if (!authorized || !canReviewApprovals) {
      setLoading(false);
      setList([]);
      return;
    }
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

  useEffect(() => { load(); }, [authorized, canReviewApprovals]);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  if (!canReviewApprovals) {
    return (
      <View className='page'>
        <View className='status-panel'>
          <View className='status-panel__mark'>!</View>
          <Text className='status-panel__title'>暂无查看权限</Text>
          <Text className='status-panel__desc'>待办审批仅对可办理业务的负责人开放</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='page'>
      <ScrollView scrollY className='page-scroll'>
        <View className='content-meta'>
          <Text>业务待办</Text>
          <Text className='content-meta__strong'>{loading ? '--' : `${list.length} 项`}</Text>
        </View>

        {loading ? (
          <View className='status-panel'>
            <Text className='status-panel__desc'>正在同步待审批记录...</Text>
          </View>
        ) : list.length === 0 ? (
          <View className='status-panel'>
            <View className='status-panel__mark'>✓</View>
            <Text className='status-panel__title'>待办已处理完毕</Text>
            <Text className='status-panel__desc'>当前没有需要审批的入会或退款申请</Text>
          </View>
        ) : (
          <View className='entity-list'>
            {list.map((item) => {
              const customerName = item.customer?.name || '未命名客户';
              return (
                <View
                  key={item.id}
                  className='entity-row'
                  onClick={() => Taro.navigateTo({ url: `/pages/memberships/detail?id=${item.id}` })}
                >
                  <View className='avatar'>{customerName.slice(0, 1)}</View>
                  <View className='entity-row__body'>
                    <View className='entity-row__top'>
                      <Text className='entity-row__title'>{customerName}</Text>
                      <Text className='tag tag--pending'>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </Text>
                    </View>
                    <View className='entity-row__bottom'>
                      <Text className='entity-row__meta'>
                        {item.submitter?.name ? `提交人 ${item.submitter.name}` : '提交人未记录'}
                      </Text>
                      <Text className='entity-row__value amount--pending'>
                        ¥{Number(item.fee).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text className='entity-row__arrow'>›</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
