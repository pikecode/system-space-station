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
  ACTIVE: '意向会员',
  INACTIVE: '停用',
  PENDING: '待审批',
  APPROVED: '待缴费',
  PAID: '已缴费',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
  REFUND_PENDING: '退款审批中',
  REFUNDED: '已退款',
  GENERATED: '待结算',
  SETTLED: '已到账',
};

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : '-';
}

function formatMoney(value?: string | number | null) {
  return `¥${Number(value ?? 0).toLocaleString()}`;
}

export default function CustomerPortalPage() {
  const authorized = useRequireLogin();
  const logout = useAuthStore((s) => s.logout);
  const [data, setData] = useState<CustomerPortalMe | null>(null);
  const [loading, setLoading] = useState(true);
  const investmentTotal = (data?.investments ?? []).reduce((sum, item) => sum + Number(item.amount), 0);
  const settledProfitTotal = (data?.profitRecords ?? [])
    .filter((item) => item.status === 'SETTLED')
    .reduce((sum, item) => sum + Number(item.customerAmount), 0);
  const pendingProfitTotal = (data?.profitRecords ?? [])
    .filter((item) => item.status !== 'SETTLED')
    .reduce((sum, item) => sum + Number(item.customerAmount), 0);

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
          <Text className='identity-band__eyebrow'>投资会员</Text>
          <Text className='identity-band__title'>{data?.name ?? '加载中'}</Text>
          <Text className='identity-band__meta'>{data?.customerNo ?? '-'}</Text>
        </View>
        <Text className='tag tag--approved'>{STATUS_LABELS[data?.status ?? ''] ?? '加载中'}</Text>
      </View>

      <ScrollView scrollY className='page-scroll'>
        <View className='summary-band'>
          <View className='metric'>
            <Text className='metric__label'>投资本金</Text>
            <Text className='metric__value'>{formatMoney(investmentTotal)}</Text>
          </View>
          <View className='metric'>
            <Text className='metric__label'>已到账收益</Text>
            <Text className='metric__value'>{formatMoney(settledProfitTotal)}</Text>
          </View>
          <View className='metric'>
            <Text className='metric__label'>待结算收益</Text>
            <Text className='metric__value metric__value--warning'>{formatMoney(pendingProfitTotal)}</Text>
          </View>
        </View>

        <View className='section-title'>账户信息</View>
        <View className='surface'>
          <View className='row'>
            <Text className='row__label'>客户类型</Text>
            <Text className='row__value'>{CUSTOMER_TYPE_LABELS[data?.customerType ?? ''] ?? '-'}</Text>
          </View>
          <View className='row'>
            <Text className='row__label'>账户状态</Text>
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
            <Text className='row__label'>投资笔数</Text>
            <Text className='row__value'>{data?.investments?.length ?? 0}</Text>
          </View>
        </View>

        <View className='section-title'>
          <Text>我的投资</Text>
          <Text className='section-title__hint'>本金明细</Text>
        </View>
        {loading ? (
          <View className='status-panel'>
            <Text className='status-panel__desc'>正在同步投资信息...</Text>
          </View>
        ) : !data?.investments?.length ? (
          <View className='status-panel'>
            <Text className='status-panel__title'>暂无投资记录</Text>
            <Text className='status-panel__desc'>投资成功后会自动成为正式会员，并展示投资明细</Text>
          </View>
        ) : (
          <View className='entity-list'>
            {data.investments.map((item) => (
              <View key={item.id} className='entity-row'>
                <View className='entity-row__body'>
                  <View className='entity-row__top'>
                    <Text className='entity-row__title'>{item.product.name}</Text>
                    <Text className='tag tag--approved'>{item.product.productNo}</Text>
                  </View>
                  <View className='entity-row__bottom'>
                    <Text className='entity-row__meta'>{formatDate(item.investedAt)} · {item.investmentNo}</Text>
                    <Text className='entity-row__value'>{formatMoney(item.amount)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className='section-title'>
          <Text>收益记录</Text>
          <Text className='section-title__hint'>客户实际到账</Text>
        </View>
        {loading ? (
          <View className='status-panel'>
            <Text className='status-panel__desc'>正在同步收益信息...</Text>
          </View>
        ) : !data?.profitRecords?.length ? (
          <View className='status-panel'>
            <Text className='status-panel__title'>暂无收益记录</Text>
            <Text className='status-panel__desc'>后台确认产品收益后会展示客户实际收益</Text>
          </View>
        ) : (
          <View className='entity-list'>
            {data.profitRecords.map((item) => (
              <View key={item.id} className='entity-row'>
                <View className='entity-row__body'>
                  <View className='entity-row__top'>
                    <Text className='entity-row__title'>{item.product.name}</Text>
                    <Text className='tag tag--approved'>{STATUS_LABELS[item.status] ?? item.status}</Text>
                  </View>
                  <View className='entity-row__bottom'>
                    <Text className='entity-row__meta'>
                      {formatDate(item.yieldPeriod.periodStart)} 至 {formatDate(item.yieldPeriod.periodEnd)}
                    </Text>
                    <Text className='entity-row__value'>{formatMoney(item.customerAmount)}</Text>
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
