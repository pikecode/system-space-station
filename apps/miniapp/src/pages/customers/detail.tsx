import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Button, Input, Textarea, Picker } from '@tarojs/components';
import { customersApi, type CustomerRow } from '../../services/customers';
import { useAuthStore } from '../../store/auth';

const SOURCE_OPTIONS = [
  { label: '转介绍', value: 'REFERRAL' },
  { label: '自主开发', value: 'SELF_DEVELOPED' },
  { label: '活动获客', value: 'ACTIVITY' },
  { label: '线上渠道', value: 'ONLINE' },
  { label: '其他', value: 'OTHER' },
];
const CUSTOMER_TYPE_LABELS = ['个人', '企业'];
const CUSTOMER_TYPE_VALUES = ['INDIVIDUAL', 'COMPANY'];
const GENDER_LABELS = ['男', '女', '未知'];
const GENDER_VALUES = ['MALE', 'FEMALE', 'UNKNOWN'];
const REG_SOURCE_LABELS: Record<string, string> = {
  SELF: '客户自助填写', PARTNER: '合伙人录入', ADMIN: '管理员录入',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核', APPROVED: '有效', REJECTED: '已拒绝',
  EXPIRED: '已到期', REFUND_PENDING: '退款中', REFUNDED: '已退款',
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'tag--pending', APPROVED: 'tag--approved', REJECTED: 'tag--rejected',
  EXPIRED: 'tag--expired', REFUND_PENDING: 'tag--pending', REFUNDED: 'tag--expired',
};

type FormState = {
  shareCode: string; name: string; phone: string;
  customerType: string; source: string;
  gender: string; birthday: string; address: string;
  wechat: string; tags: string; notes: string;
  creditCode: string; industry: string; contactName: string; contactPhone: string;
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
  const [form, setForm] = useState<FormState>({
    shareCode: user?.shareCode ?? '',
    name: '', phone: '', customerType: 'INDIVIDUAL', source: 'REFERRAL',
    gender: 'UNKNOWN', birthday: '', address: '',
    wechat: '', tags: '', notes: '',
    creditCode: '', industry: '', contactName: '', contactPhone: '',
  });

  useEffect(() => {
    if (!isCreate && id) {
      customersApi.getOne(id).then((data) => {
        setCustomer(data);
        setForm({
          shareCode: '',
          name: data.name, phone: data.phone,
          customerType: data.customerType, source: data.source,
          gender: data.gender ?? 'UNKNOWN', birthday: data.birthday?.slice(0, 10) ?? '',
          address: data.address ?? '', wechat: data.wechat ?? '',
          tags: data.tags ?? '', notes: data.notes ?? '',
          creditCode: data.creditCode ?? '', industry: data.industry ?? '',
          contactName: data.contactName ?? '', contactPhone: data.contactPhone ?? '',
        });
        setLoading(false);
      }).catch(() => { Taro.showToast({ title: '加载失败', icon: 'none' }); setLoading(false); });
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.name.trim()) { Taro.showToast({ title: '请填写姓名', icon: 'none' }); return; }
    if (!/^1\d{10}$/.test(form.phone)) { Taro.showToast({ title: '请填写正确的手机号', icon: 'none' }); return; }
    if (isCreate && !form.shareCode.trim()) { Taro.showToast({ title: '请填写分享码', icon: 'none' }); return; }
    setSaving(true);
    const isCompany = form.customerType === 'COMPANY';
    const extraFields = !isCompany
      ? { gender: form.gender || undefined, birthday: form.birthday || undefined, address: form.address.trim() || undefined }
      : { creditCode: form.creditCode.trim() || undefined, industry: form.industry.trim() || undefined, contactName: form.contactName.trim() || undefined, contactPhone: form.contactPhone.trim() || undefined };
    try {
      if (isCreate) {
        await customersApi.create({
          shareCode: form.shareCode.trim(),
          customerType: form.customerType as 'INDIVIDUAL' | 'COMPANY',
          name: form.name.trim(), phone: form.phone, source: form.source,
          wechat: form.wechat.trim() || undefined,
          tags: form.tags.trim() || undefined,
          notes: form.notes.trim() || undefined,
          ...extraFields,
        });
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        await customersApi.update(id!, {
          name: form.name.trim(), phone: form.phone,
          customerType: form.customerType, source: form.source,
          wechat: form.wechat.trim() || undefined,
          tags: form.tags.trim() || undefined,
          notes: form.notes.trim() || undefined,
          ...extraFields,
        });
        Taro.showToast({ title: '保存成功', icon: 'success' });
        setEditing(false);
        customersApi.getOne(id!).then(setCustomer);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormState) => (e: any) => setForm({ ...form, [key]: e.detail.value });
  const typeIndex = Math.max(CUSTOMER_TYPE_VALUES.indexOf(form.customerType), 0);
  const sourceIndex = Math.max(SOURCE_OPTIONS.findIndex(s => s.value === form.source), 0);
  const genderIndex = Math.max(GENDER_VALUES.indexOf(form.gender), 0);
  const isCompanyForm = form.customerType === 'COMPANY';

  if (loading) return <View className='loading'>加载中…</View>;

  return (
    <View className='page'>
      <ScrollView scrollY style={{ height: '100vh' }}>
        {editing ? (
          <View style={{ paddingBottom: '160rpx' }}>

            {isCreate && (
              <View>
                <View className='section-title'>归属信息</View>
                <View className='field'>
                  <Text className='field__label'>分享码 <Text style={{ color: '#f5222d' }}>*</Text></Text>
                  <Input className='field__input' placeholder='营销人员的分享码'
                    value={form.shareCode} onInput={set('shareCode')} />
                </View>
              </View>
            )}

            <View className='section-title'>基本信息</View>

            <Picker mode='selector' range={CUSTOMER_TYPE_LABELS} value={typeIndex}
              onChange={(e) => setForm({ ...form, customerType: CUSTOMER_TYPE_VALUES[+e.detail.value] })}>
              <View className='field'>
                <Text className='field__label'>客户类型 <Text style={{ color: '#f5222d' }}>*</Text></Text>
                <Text style={{ flex: 1, fontSize: '28rpx', color: 'var(--color-text-1)', textAlign: 'right' }}>
                  {CUSTOMER_TYPE_LABELS[typeIndex]} ›
                </Text>
              </View>
            </Picker>

            <Picker mode='selector' range={SOURCE_OPTIONS.map(s => s.label)} value={sourceIndex}
              onChange={(e) => setForm({ ...form, source: SOURCE_OPTIONS[+e.detail.value].value })}>
              <View className='field'>
                <Text className='field__label'>客户来源</Text>
                <Text style={{ flex: 1, fontSize: '28rpx', color: 'var(--color-text-1)', textAlign: 'right' }}>
                  {SOURCE_OPTIONS[sourceIndex]?.label} ›
                </Text>
              </View>
            </Picker>

            <View className='field'>
              <Text className='field__label'>{isCompanyForm ? '企业名称' : '姓名'} <Text style={{ color: '#f5222d' }}>*</Text></Text>
              <Input className='field__input' placeholder={isCompanyForm ? '请输入企业名称' : '请输入姓名'} maxlength={50}
                value={form.name} onInput={set('name')} />
            </View>
            <View className='field'>
              <Text className='field__label'>{isCompanyForm ? '联系电话' : '手机号'} <Text style={{ color: '#f5222d' }}>*</Text></Text>
              <Input className='field__input' type='number' placeholder={isCompanyForm ? '请输入联系电话' : '请输入手机号'} maxlength={11}
                value={form.phone} onInput={set('phone')} />
            </View>
            <View className='field'>
              <Text className='field__label'>微信号</Text>
              <Input className='field__input' placeholder='选填' maxlength={64}
                value={form.wechat} onInput={set('wechat')} />
            </View>

            {!isCompanyForm && (
              <View>
                <View className='section-title'>个人信息</View>
                <Picker mode='selector' range={GENDER_LABELS} value={genderIndex}
                  onChange={(e) => setForm({ ...form, gender: GENDER_VALUES[+e.detail.value] })}>
                  <View className='field'>
                    <Text className='field__label'>性别</Text>
                    <Text style={{ flex: 1, fontSize: '28rpx', color: 'var(--color-text-1)', textAlign: 'right' }}>
                      {GENDER_LABELS[genderIndex]} ›
                    </Text>
                  </View>
                </Picker>
                <Picker mode='date' value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.detail.value })}>
                  <View className='field'>
                    <Text className='field__label'>生日</Text>
                    <Text style={{ flex: 1, fontSize: '28rpx', color: form.birthday ? 'var(--color-text-1)' : 'var(--color-text-3)', textAlign: 'right' }}>
                      {form.birthday || '选填'} ›
                    </Text>
                  </View>
                </Picker>
                <View className='field'>
                  <Text className='field__label'>地址</Text>
                  <Input className='field__input' placeholder='选填' maxlength={200}
                    value={form.address} onInput={set('address')} />
                </View>
              </View>
            )}

            {isCompanyForm && (
              <View>
                <View className='section-title'>企业信息</View>
                <View className='field'>
                  <Text className='field__label'>统一信用代码</Text>
                  <Input className='field__input' placeholder='选填' maxlength={18}
                    value={form.creditCode} onInput={set('creditCode')} />
                </View>
                <View className='field'>
                  <Text className='field__label'>行业</Text>
                  <Input className='field__input' placeholder='选填' maxlength={50}
                    value={form.industry} onInput={set('industry')} />
                </View>
                <View className='section-title'>联系人</View>
                <View className='field'>
                  <Text className='field__label'>联系人姓名</Text>
                  <Input className='field__input' placeholder='选填' maxlength={50}
                    value={form.contactName} onInput={set('contactName')} />
                </View>
                <View className='field'>
                  <Text className='field__label'>联系人手机</Text>
                  <Input className='field__input' type='number' placeholder='选填' maxlength={11}
                    value={form.contactPhone} onInput={set('contactPhone')} />
                </View>
              </View>
            )}

            <View className='section-title'>标签 / 备注</View>
            <View className='field'>
              <Text className='field__label'>标签</Text>
              <Input className='field__input' placeholder='多个标签用逗号分隔'
                value={form.tags} onInput={set('tags')} />
            </View>
            <View style={{ padding: '0 32rpx 24rpx' }}>
              <Textarea
                style={{ width: '100%', fontSize: '28rpx', minHeight: '160rpx', background: 'var(--color-surface)', padding: '20rpx', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }}
                placeholder='备注（选填）' value={form.notes}
                onInput={(e) => setForm({ ...form, notes: e.detail.value })}
              />
            </View>
          </View>
        ) : (
          <View style={{ paddingBottom: '120rpx' }}>
            {/* Hero Banner */}
            <View style={{
              background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)',
              borderRadius: '0 0 32rpx 32rpx',
              padding: '32rpx 32rpx 40rpx',
              display: 'flex',
              alignItems: 'center',
              gap: '24rpx',
            }}>
              <View style={{
                width: '120rpx', height: '120rpx', borderRadius: '999rpx',
                background: 'rgba(255,255,255,0.2)',
                border: '4rpx solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Text style={{ color: 'var(--color-text-inv)', fontSize: '48rpx', fontWeight: '800' }}>
                  {customer?.name?.[0] ?? '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '40rpx', fontWeight: '800', color: 'var(--color-text-inv)', display: 'block' }}>
                  {customer?.name}
                </Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx' }}>
                  <View style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999rpx', padding: '4rpx 16rpx' }}>
                    <Text style={{ color: 'var(--color-text-inv)', fontSize: '22rpx', fontWeight: '500' }}>
                      {customer?.customerType === 'INDIVIDUAL' ? '个人客户' : '企业客户'}
                    </Text>
                  </View>
                  {customer?.registrationSource && (
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22rpx' }}>
                      {REG_SOURCE_LABELS[customer.registrationSource] ?? customer.registrationSource}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* 基本信息 */}
            <View className='section-title'>基本信息</View>
            <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', margin: '0 24rpx' }}>
              {[
                { label: customer?.customerType === 'COMPANY' ? '联系电话' : '手机号', value: customer?.phone },
                { label: '微信号', value: customer?.wechat },
                { label: '来源', value: SOURCE_OPTIONS.find(s => s.value === customer?.source)?.label },
                { label: '标签', value: customer?.tags },
              ].map(({ label, value }, i, arr) => (
                <View key={label} className='row' style={{ padding: '24rpx 32rpx', borderBottom: i < arr.length - 1 ? '1rpx solid #f0f1f3' : 'none' }}>
                  <Text className='row__label'>{label}</Text>
                  <Text className='row__value' style={{ color: value ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>{value || '-'}</Text>
                </View>
              ))}
            </View>

            {/* 个人信息 */}
            {customer?.customerType === 'INDIVIDUAL' && (
              <View>
                <View className='section-title'>个人信息</View>
                <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', margin: '0 24rpx' }}>
                  {[
                    { label: '性别', value: customer?.gender ? GENDER_LABELS[GENDER_VALUES.indexOf(customer.gender)] : undefined },
                    { label: '生日', value: customer?.birthday?.slice(0, 10) },
                    { label: '地址', value: customer?.address },
                  ].map(({ label, value }, i, arr) => (
                    <View key={label} className='row' style={{ padding: '24rpx 32rpx', borderBottom: i < arr.length - 1 ? '1rpx solid #f0f1f3' : 'none' }}>
                      <Text className='row__label'>{label}</Text>
                      <Text className='row__value' style={{ color: value ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>{value || '-'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 企业信息 */}
            {customer?.customerType === 'COMPANY' && (
              <View>
                <View className='section-title'>企业信息</View>
                <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', margin: '0 24rpx' }}>
                  {[
                    { label: '统一信用代码', value: customer?.creditCode },
                    { label: '行业', value: customer?.industry },
                    { label: '联系人', value: customer?.contactName },
                    { label: '联系手机', value: customer?.contactPhone },
                  ].map(({ label, value }, i, arr) => (
                    <View key={label} className='row' style={{ padding: '24rpx 32rpx', borderBottom: i < arr.length - 1 ? '1rpx solid #f0f1f3' : 'none' }}>
                      <Text className='row__label'>{label}</Text>
                      <Text className='row__value' style={{ color: value ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>{value || '-'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 备注 */}
            <View className='section-title'>备注</View>
            <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', margin: '0 24rpx', padding: '24rpx 32rpx' }}>
              <Text style={{ fontSize: '28rpx', color: customer?.notes ? 'var(--color-text-1)' : 'var(--color-text-3)', lineHeight: '1.6' }}>
                {customer?.notes || '暂无备注'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', padding: 'var(--space-sm) var(--space-md)', borderTop: '1rpx solid var(--color-divider)', display: 'flex', gap: 'var(--space-xs)' }}>
        {editing ? (
          <View style={{ display: 'flex', flex: 1, gap: 'var(--space-xs)' }}>
            {!isCreate && (
              <Button style={{ flex: 1, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} onClick={() => setEditing(false)}>取消</Button>
            )}
            <Button style={{ flex: 2, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} loading={saving} onClick={handleSave}>保存</Button>
          </View>
        ) : (
          <Button style={{ flex: 1, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', height: '96rpx', fontSize: '30rpx', fontWeight: '600' }} onClick={() => setEditing(true)}>编辑</Button>
        )}
      </View>
    </View>
  );
}
