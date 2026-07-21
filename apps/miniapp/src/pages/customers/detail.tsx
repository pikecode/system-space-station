import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Button, Input, Textarea, Picker } from '@tarojs/components';
import { customersApi, type CustomerRow } from '../../services/customers';
import { membershipsApi } from '../../services/memberships';
import { useAuthStore } from '../../store/auth';

const SOURCE_OPTIONS = [
  { label: '转介绍', value: 'REFERRAL' },
  { label: '自主开发', value: 'SELF_DEVELOPED' },
  { label: '活动获客', value: 'ACTIVITY' },
  { label: '线上渠道', value: 'ONLINE' },
  { label: '其他', value: 'OTHER' },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核', APPROVED: '有效', REJECTED: '已拒绝',
  EXPIRED: '已到期', REFUND_PENDING: '退款中', REFUNDED: '已退款',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending', APPROVED: 'tag--approved',
  REJECTED: 'tag--rejected', EXPIRED: 'tag--expired',
  REFUND_PENDING: 'tag--pending', REFUNDED: 'tag--expired',
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id, mode } = router.params;
  const isCreate = mode === 'create';
  const user = useAuthStore((s) => s.user);

  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [editing, setEditing] = useState(isCreate);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', customerType: 'INDIVIDUAL',
    source: 'OTHER', tags: '', notes: '', wechat: '',
  });

  useEffect(() => {
    if (!isCreate && id) {
      customersApi.getOne(id).then((data) => {
        setCustomer(data);
        setForm({
          name: data.name, phone: data.phone,
          customerType: data.customerType, source: data.source,
          tags: data.tags ?? '', notes: data.notes ?? '', wechat: data.wechat ?? '',
        });
        setLoading(false);
      }).catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' });
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      Taro.showToast({ title: '姓名和手机号必填', icon: 'none' }); return;
    }
    setSaving(true);
    try {
      if (isCreate) {
        await customersApi.create(form);
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        await customersApi.update(id!, form);
        Taro.showToast({ title: '保存成功', icon: 'success' });
        setEditing(false);
        customersApi.getOne(id!).then(setCustomer);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View className='loading'>加载中…</View>;

  return (
    <View className='page'>
      <ScrollView scrollY style={{ height: '100vh' }}>
        {editing ? (
          <View style={{ paddingBottom: '160rpx' }}>
            <View className='section-title'>基本信息</View>
            {[
              { label: '姓名', key: 'name', placeholder: '请输入姓名' },
              { label: '手机', key: 'phone', placeholder: '请输入手机号' },
              { label: '微信', key: 'wechat', placeholder: '微信号（选填）' },
              { label: '标签', key: 'tags', placeholder: '多个标签用逗号分隔' },
            ].map(({ label, key, placeholder }) => (
              <View key={key} className='field'>
                <Text className='field__label'>{label}</Text>
                <Input
                  className='field__input'
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onInput={(e) => setForm({ ...form, [key]: e.detail.value })}
                />
              </View>
            ))}
            <View className='field'>
              <Text className='field__label'>备注</Text>
              <Textarea
                style={{ width: '100%', fontSize: '28rpx', minHeight: '120rpx' }}
                placeholder='备注（选填）'
                value={form.notes}
                onInput={(e) => setForm({ ...form, notes: e.detail.value })}
              />
            </View>
          </View>
        ) : (
          <>
            <View className='card' style={{ margin: '24rpx' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
                <Text style={{ fontSize: '36rpx', fontWeight: '700' }}>{customer?.name}</Text>
                <Text className='tag'>{customer?.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Text>
              </View>
              {[
                { label: '手机', value: customer?.phone },
                { label: '微信', value: customer?.wechat },
                { label: '来源', value: SOURCE_OPTIONS.find(s => s.value === customer?.source)?.label },
                { label: '标签', value: customer?.tags },
                { label: '备注', value: customer?.notes },
              ].map(({ label, value }) => value ? (
                <View key={label} className='row'>
                  <Text className='row__label'>{label}</Text>
                  <Text className='row__value'>{value}</Text>
                </View>
              ) : null)}
            </View>

            <View className='section-title'>会员记录</View>
            {(customer?.memberships ?? []).length === 0 ? (
              <View className='empty'>暂无会员记录</View>
            ) : (customer?.memberships ?? []).map((m) => (
              <View
                key={m.id} className='card' style={{ margin: '0 24rpx 16rpx', cursor: 'pointer' }}
                onClick={() => Taro.navigateTo({ url: `/pages/memberships/detail?id=${m.id}` })}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                  <Text style={{ fontWeight: '600' }}>{m.memberLevel?.name ?? '会员'}</Text>
                  <Text className={`tag ${STATUS_CLASS[m.status] ?? ''}`}>{STATUS_LABELS[m.status] ?? m.status}</Text>
                </View>
                <Text style={{ fontSize: '26rpx', color: '#888' }}>
                  ¥{Number(m.fee).toLocaleString()} · {m.startDate?.slice(0, 10)} ~ {m.endDate?.slice(0, 10)}
                </Text>
              </View>
            ))}

            <View style={{ padding: '24rpx' }}>
              <Button
                style={{ background: '#00a3a3', color: '#fff', borderRadius: '12rpx', marginBottom: '16rpx' }}
                onClick={() => Taro.navigateTo({ url: `/pages/memberships/create?customerId=${customer?.id}&customerName=${customer?.name}` })}
              >
                提交会员申请
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '24rpx 32rpx', borderTop: '1rpx solid #f0f1f3', display: 'flex', gap: '16rpx' }}>
        {editing ? (
          <>
            {!isCreate && <Button style={{ flex: 1, background: '#f5f6f8', color: '#666', borderRadius: '12rpx' }} onClick={() => setEditing(false)}>取消</Button>}
            <Button style={{ flex: 2, background: '#00a3a3', color: '#fff', borderRadius: '12rpx' }} loading={saving} onClick={handleSave}>保存</Button>
          </>
        ) : (
          <Button style={{ flex: 1, background: '#00a3a3', color: '#fff', borderRadius: '12rpx' }} onClick={() => setEditing(true)}>编辑</Button>
        )}
      </View>
    </View>
  );
}
