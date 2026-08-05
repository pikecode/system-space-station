import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { commissionsApi, type CommissionRecord } from '../../services/commissions';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const ROLE_LABELS: Record<string, string> = {
  MEMBER: '维护人',
  DEPT_HEAD: '部门负责人',
  MARKET_HEAD: '市场部负责人',
  COMPANY: '公司',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: '待结算',
  PENDING_PAYMENT: '待出账',
  SETTLED: '已结算',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending',
  PENDING_PAYMENT: 'tag--pending',
  SETTLED: 'tag--approved',
};

export default function CommissionsListPage() {
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();
  const [list, setList] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    const fetch = user?.role === 'HEAD'
      ? commissionsApi.getDepartment()
      : commissionsApi.getMy();
    fetch
      .then((page) => setList(page.data))
      .catch((e: any) => Taro.showToast({ title: e.message || '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [authorized, user?.role]);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  const totalPending = list
    .filter((record) => record.status === 'PENDING' && record.entryType === 'EARNING')
    .reduce((sum, record) => sum + Number(record.amount), 0);
  const totalSettled = list
    .filter((record) => record.status === 'SETTLED' && record.entryType === 'EARNING')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  return (
    <View className='page'>
      <View className='summary-band'>
        <View className='metric'>
          <Text className='metric__label'>待结算收入</Text>
          <Text className='metric__value metric__value--warning'>
            ¥{totalPending.toLocaleString()}
          </Text>
        </View>
        <View className='metric'>
          <Text className='metric__label'>已结算收入</Text>
          <Text className='metric__value'>¥{totalSettled.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView scrollY className='workflow-scroll'>
        <View className='content-meta'>
          <Text>{user?.role === 'HEAD' ? '部门分成明细' : '我的分成明细'}</Text>
          <Text className='content-meta__strong'>{loading ? '--' : `${list.length} 条`}</Text>
        </View>

        {loading ? (
          <View className='status-panel'>
            <Text className='status-panel__desc'>正在同步分成记录...</Text>
          </View>
        ) : list.length === 0 ? (
          <View className='status-panel'>
            <View className='status-panel__mark'>¥</View>
            <Text className='status-panel__title'>暂无分成记录</Text>
            <Text className='status-panel__desc'>产生会员业务后，分成明细会显示在这里</Text>
          </View>
        ) : (
          <View className='entity-list'>
            {list.map((item) => {
              const amount = Number(item.amount);
              return (
                <View key={item.id} className='entity-row'>
                  <View className='entity-row__body'>
                    <View className='entity-row__top'>
                      <Text className='entity-row__title'>
                        {item.membership?.customer?.name ?? '未关联客户'}
                      </Text>
                      <Text className={`tag ${STATUS_CLASS[item.status] ?? 'tag--neutral'}`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </Text>
                    </View>
                    <View className='entity-row__bottom'>
                      <Text className='entity-row__meta'>
                        {ROLE_LABELS[item.receiverRole] ?? item.receiverRole}
                        {item.createdAt ? ` · ${item.createdAt.slice(0, 10)}` : ''}
                      </Text>
                      <Text className={`entity-row__value ${amount < 0 ? 'amount--negative' : ''}`}>
                        {amount < 0 ? '-' : ''}¥{Math.abs(amount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
