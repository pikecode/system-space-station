import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { customerPortalApi, type CustomerPortalMe } from '../../services/customerPortal';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: '个人客户',
  COMPANY: '企业客户',
};

const STATUS_LABELS: Record<string, string> = {
  PROSPECT: '意向会员',
  ACTIVE_MEMBER: '正式会员',
  ACTIVE: '正常',
  INACTIVE: '停用',
  PENDING: '待审批',
  APPROVED: '待缴费',
  PAID: '已缴费',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
  REFUND_PENDING: '退款审批中',
  REFUNDED: '已退款',
};

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : '-';
}

export default function CustomerPortalPage() {
  const authorized = useRequireLogin();
  const logout = useAuthStore((s) => s.logout);
  const [data, setData] = useState<CustomerPortalMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    customerPortalApi.me()
      .then(setData)
      .finally(() => setLoading(false));
  }, [authorized]);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  return (
    <View className='page'>
      <View className='identity-band'>
        <View className='avatar avatar--large'>{data?.name?.[0] ?? '?'}</View>
        <View className='identity-band__body'>
          <Text className='identity-band__eyebrow'>当前会员</Text>
          <Text className='identity-band__title'>{data?.name ?? '加载中'}</Text>
          <Text className='identity-band__meta'>{data?.customerNo ?? '-'}</Text>
        </View>
      </View>

      <ScrollView scrollY className='page-scroll'>
        <View className='section-title'>企业信息</View>
        <View className='surface'>
          <View className='row'>
            <Text className='row__label'>客户类型</Text>
            <Text className='row__value'>{CUSTOMER_TYPE_LABELS[data?.customerType ?? ''] ?? '-'}</Text>
          </View>
          <View className='row'>
            <Text className='row__label'>会员状态</Text>
            <Text className='row__value'>{STATUS_LABELS[data?.status ?? ''] ?? '-'}</Text>
          </View>
          <View className='row'>
            <Text className='row__label'>联系电话</Text>
            <Text className='row__value'>{data?.phone ?? '-'}</Text>
          </View>
          <View className='row'>
            <Text className='row__label'>激活时间</Text>
            <Text className='row__value'>{formatDate(data?.memberActivatedAt)}</Text>
          </View>
          <View className='row'>
            <Text className='row__label'>投资金额</Text>
            <Text className='row__value'>
              {data?.investmentAmount ? `¥${Number(data.investmentAmount).toLocaleString()}` : '-'}
            </Text>
          </View>
        </View>

        <View className='section-title'>入会记录</View>
        {loading ? (
          <View className='status-panel'>
            <Text className='status-panel__desc'>正在同步会员信息...</Text>
          </View>
        ) : !data?.memberships?.length ? (
          <View className='status-panel'>
            <Text className='status-panel__title'>暂无入会记录</Text>
            <Text className='status-panel__desc'>完成缴费后会展示正式会员信息</Text>
          </View>
        ) : (
          <View className='entity-list'>
            {data.memberships.map((item) => (
              <View key={item.id} className='entity-row'>
                <View className='entity-row__body'>
                  <View className='entity-row__top'>
                    <Text className='entity-row__title'>{item.memberLevel?.name ?? item.memberNo}</Text>
                    <Text className='tag tag--approved'>{STATUS_LABELS[item.status] ?? item.status}</Text>
                  </View>
                  <View className='entity-row__bottom'>
                    <Text className='entity-row__meta'>{formatDate(item.startDate)} 至 {formatDate(item.endDate)}</Text>
                    <Text className='entity-row__value'>¥{Number(item.fee).toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className='logout-action' onClick={logout}>退出登录</View>
      </ScrollView>
    </View>
  );
}
