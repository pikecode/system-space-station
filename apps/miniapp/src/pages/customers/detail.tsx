import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Button, Input, Textarea, Picker } from '@tarojs/components';
import type { CustomerSource, CustomerType, Gender, RiskTolerance } from 'shared';
import { customersApi, type CustomerRow } from '../../services/customers';
import { useAuthStore } from '../../store/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

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
const EDIT_TABS = ['基本信息', '详细信息', '备注'];
const RISK_LABELS = ['保守型', '稳健型', '积极型', '激进型'];
const RISK_VALUES = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'SPECULATIVE'];

type FormState = {
  shareCode: string; name: string; phone: string;
  customerType: string; source: string;
  gender: string; birthday: string; address: string;
  wechat: string; tags: string; notes: string;
  creditCode: string; industry: string; contactName: string; contactPhone: string;
  legalPerson: string; registeredCapital: string;
  idCard: string; riskTolerance: string; isAccreditedInvestor: boolean; investmentAmount: string;
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id, mode } = router.params;
  const isCreate = mode === 'create';
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();

  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [editing, setEditing] = useState(isCreate);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormState>({
    shareCode: user?.shareCode ?? '',
    name: '', phone: '', customerType: 'INDIVIDUAL', source: 'REFERRAL',
    gender: 'UNKNOWN', birthday: '', address: '',
    wechat: '', tags: '', notes: '',
    creditCode: '', industry: '', contactName: '', contactPhone: '',
    legalPerson: '', registeredCapital: '',
    idCard: '', riskTolerance: '', isAccreditedInvestor: false, investmentAmount: '',
  });

  useEffect(() => {
    if (authorized && !isCreate && id) {
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
          legalPerson: data.legalPerson ?? '', registeredCapital: data.registeredCapital ?? '',
          idCard: data.idCard ?? '', riskTolerance: data.riskTolerance ?? '',
          isAccreditedInvestor: data.isAccreditedInvestor ?? false, investmentAmount: data.investmentAmount ?? '',
        });
        setLoading(false);
      }).catch(() => { Taro.showToast({ title: '加载失败', icon: 'none' }); setLoading(false); });
    }
  }, [authorized, id, isCreate]);

  const handleSave = async () => {
    if (!form.name.trim()) { Taro.showToast({ title: '请填写姓名', icon: 'none' }); setActiveTab(0); return; }
    if (!/^1\d{10}$/.test(form.phone)) { Taro.showToast({ title: '请填写正确的手机号', icon: 'none' }); setActiveTab(0); return; }
    if (isCreate && !form.shareCode.trim()) { Taro.showToast({ title: '请填写分享码', icon: 'none' }); setActiveTab(0); return; }
    setSaving(true);
    const isCompany = form.customerType === 'COMPANY';
    const typeFields = !isCompany
      ? { gender: (form.gender || undefined) as Gender | undefined, birthday: form.birthday || undefined, address: form.address.trim() || undefined, idCard: form.idCard.trim() || undefined }
      : { creditCode: form.creditCode.trim() || undefined, industry: form.industry.trim() || undefined, contactName: form.contactName.trim() || undefined, contactPhone: form.contactPhone.trim() || undefined, legalPerson: form.legalPerson.trim() || undefined, registeredCapital: form.registeredCapital.trim() || undefined };
    const investFields = {
      riskTolerance: (form.riskTolerance || undefined) as RiskTolerance | undefined,
      isAccreditedInvestor: form.isAccreditedInvestor,
      investmentAmount: form.investmentAmount || undefined,
    };
    try {
      if (isCreate) {
        await customersApi.create({
          shareCode: form.shareCode.trim(),
          customerType: form.customerType as CustomerType,
          name: form.name.trim(), phone: form.phone, source: form.source as CustomerSource,
          wechat: form.wechat.trim() || undefined,
          tags: form.tags.trim() || undefined,
          notes: form.notes.trim() || undefined,
          ...typeFields, ...investFields,
        });
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        await customersApi.update(id!, {
          name: form.name.trim(), phone: form.phone,
          customerType: form.customerType as CustomerType, source: form.source as CustomerSource,
          wechat: form.wechat.trim() || undefined,
          tags: form.tags.trim() || undefined,
          notes: form.notes.trim() || undefined,
          ...typeFields, ...investFields,
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
  const riskIndex = Math.max(RISK_VALUES.indexOf(form.riskTolerance), 0);
  const isCompanyForm = form.customerType === 'COMPANY';

  if (!authorized) return <View className='page' />;
  if (loading) return <View className='loading'>加载中…</View>;

  return (
    <View className='page'>
      <ScrollView scrollY style={{ height: '100vh' }}>
        {editing ? (
          <View style={{ paddingBottom: '160rpx' }}>
            {/* Tab 栏 */}
            <View style={{ background: 'var(--color-surface)', display: 'flex', borderBottom: '1rpx solid var(--color-divider)', margin: 'var(--space-sm) var(--space-md) 0', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', overflow: 'hidden' }}>
              {EDIT_TABS.map((tab, i) => (
                <View
                  key={tab}
                  style={{
                    flex: 1, textAlign: 'center', padding: '24rpx 0', fontSize: '28rpx',
                    color: activeTab === i ? 'var(--color-brand)' : 'var(--color-text-2)',
                    borderBottom: activeTab === i ? '4rpx solid var(--color-brand)' : '4rpx solid transparent',
                    fontWeight: activeTab === i ? '600' : '400',
                  }}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </View>
              ))}
            </View>

            {/* Tab 0: 基本信息 */}
            {activeTab === 0 && (
              <View style={{ margin: '0 var(--space-md)', background: 'var(--color-surface)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}>
                {isCreate && (
                  <View className='field'>
                    <Text className='field__label'>分享码 <Text style={{ color: 'var(--color-error)' }}>*</Text></Text>
                    <Input className='field__input' placeholder='营销人员的分享码'
                      value={form.shareCode} onInput={set('shareCode')} />
                  </View>
                )}
                <Picker mode='selector' range={CUSTOMER_TYPE_LABELS} value={typeIndex}
                  onChange={(e) => setForm({ ...form, customerType: CUSTOMER_TYPE_VALUES[+e.detail.value] })}>
                  <View className='field'>
                    <Text className='field__label'>客户类型 <Text style={{ color: 'var(--color-error)' }}>*</Text></Text>
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
                  <Text className='field__label'>{isCompanyForm ? '企业名称' : '姓名'} <Text style={{ color: 'var(--color-error)' }}>*</Text></Text>
                  <Input className='field__input' placeholder={isCompanyForm ? '请输入企业名称' : '请输入姓名'} maxlength={50}
                    value={form.name} onInput={set('name')} />
                </View>
                <View className='field'>
                  <Text className='field__label'>{isCompanyForm ? '联系电话' : '手机号'} <Text style={{ color: 'var(--color-error)' }}>*</Text></Text>
                  <Input className='field__input' type='number' placeholder={isCompanyForm ? '请输入联系电话' : '请输入手机号'} maxlength={11}
                    value={form.phone} onInput={set('phone')} />
                </View>
                <View className='field'>
                  <Text className='field__label'>微信号</Text>
                  <Input className='field__input' placeholder='选填' maxlength={64}
                    value={form.wechat} onInput={set('wechat')} />
                </View>
                {isCompanyForm && (
                  <View className='field'>
                    <Text className='field__label'>法人代表</Text>
                    <Input className='field__input' placeholder='选填' maxlength={50}
                      value={form.legalPerson} onInput={set('legalPerson')} />
                  </View>
                )}
                {!isCompanyForm && (
                  <View className='field'>
                    <Text className='field__label'>身份证号</Text>
                    <Input className='field__input' placeholder='选填' maxlength={18}
                      value={form.idCard} onInput={set('idCard')} />
                  </View>
                )}
              </View>
            )}

            {/* Tab 1: 详细信息 */}
            {activeTab === 1 && (
              <View style={{ margin: '0 var(--space-md)', background: 'var(--color-surface)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}>
                {!isCompanyForm && (
                  <View>
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
                    <View className='field'>
                      <Text className='field__label'>统一信用代码</Text>
                      <Input className='field__input' placeholder='选填' maxlength={18}
                        value={form.creditCode} onInput={set('creditCode')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>注册资本</Text>
                      <Input className='field__input' placeholder='如：500万元' maxlength={50}
                        value={form.registeredCapital} onInput={set('registeredCapital')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>行业</Text>
                      <Input className='field__input' placeholder='选填' maxlength={50}
                        value={form.industry} onInput={set('industry')} />
                    </View>
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
                {/* 投资信息（通用） */}
                <Picker mode='selector' range={RISK_LABELS} value={riskIndex}
                  onChange={(e) => setForm({ ...form, riskTolerance: RISK_VALUES[+e.detail.value] })}>
                  <View className='field'>
                    <Text className='field__label'>风险承受能力</Text>
                    <Text style={{ flex: 1, fontSize: '28rpx', color: form.riskTolerance ? 'var(--color-text-1)' : 'var(--color-text-3)', textAlign: 'right' }}>
                      {form.riskTolerance ? RISK_LABELS[riskIndex] : '选填'} ›
                    </Text>
                  </View>
                </Picker>
                <View className='field'>
                  <Text className='field__label'>合格投资人</Text>
                  <View style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16rpx' }}>
                    {['否', '是'].map((label, i) => (
                      <View
                        key={label}
                        style={{ padding: '8rpx 24rpx', borderRadius: 'var(--radius-pill)', fontSize: '26rpx', background: form.isAccreditedInvestor === !!i ? 'var(--color-brand-light)' : 'var(--color-bg)', color: form.isAccreditedInvestor === !!i ? 'var(--color-brand)' : 'var(--color-text-2)' }}
                        onClick={() => setForm({ ...form, isAccreditedInvestor: !!i })}
                      >
                        {label}
                      </View>
                    ))}
                  </View>
                </View>
                <View className='field'>
                  <Text className='field__label'>意向投资额(万)</Text>
                  <Input className='field__input' type='digit' placeholder='选填' style={{ textAlign: 'right' }}
                    value={form.investmentAmount} onInput={set('investmentAmount')} />
                </View>
              </View>
            )}

            {/* Tab 2: 备注 */}
            {activeTab === 2 && (
              <View style={{ margin: '0 var(--space-md)', background: 'var(--color-surface)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '24rpx var(--space-md)' }}>
                <View className='field' style={{ borderBottom: 'none', paddingLeft: 0, paddingRight: 0 }}>
                  <Text className='field__label'>标签</Text>
                  <Input className='field__input' placeholder='多个标签用逗号分隔'
                    value={form.tags} onInput={set('tags')} />
                </View>
                <Textarea
                  style={{ width: '100%', fontSize: '28rpx', minHeight: '200rpx', background: 'var(--color-bg)', padding: '20rpx', borderRadius: 'var(--radius-md)', boxSizing: 'border-box', marginTop: 'var(--space-xs)' }}
                  placeholder='备注（选填）' value={form.notes}
                  onInput={(e) => setForm({ ...form, notes: e.detail.value })}
                />
              </View>
            )}
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
                    { label: '身份证号', value: customer?.idCard },
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
                    { label: '法人代表', value: customer?.legalPerson },
                    { label: '统一信用代码', value: customer?.creditCode },
                    { label: '注册资本', value: customer?.registeredCapital },
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

            {/* 投资信息 */}
            <View className='section-title'>投资信息</View>
            <View style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', margin: '0 24rpx' }}>
              {[
                { label: '风险承受能力', value: customer?.riskTolerance ? RISK_LABELS[RISK_VALUES.indexOf(customer.riskTolerance)] : undefined },
                { label: '合格投资人', value: customer?.isAccreditedInvestor != null ? (customer.isAccreditedInvestor ? '是' : '否') : undefined },
                { label: '意向投资额(万)', value: customer?.investmentAmount },
              ].map(({ label, value }, i, arr) => (
                <View key={label} className='row' style={{ padding: '24rpx 32rpx', borderBottom: i < arr.length - 1 ? '1rpx solid #f0f1f3' : 'none' }}>
                  <Text className='row__label'>{label}</Text>
                  <Text className='row__value' style={{ color: value ? 'var(--color-text-1)' : 'var(--color-text-3)' }}>{value || '-'}</Text>
                </View>
              ))}
            </View>

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
              <Button style={{ flex: 1, background: 'var(--color-surface-2)', color: 'var(--color-text-2)', borderRadius: 'var(--radius-md)', height: '96rpx', lineHeight: '96rpx', padding: 0, fontSize: '30rpx', fontWeight: '600' }} onClick={() => { setEditing(false); setActiveTab(0); }}>取消</Button>
            )}
            <Button style={{ flex: 2, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', height: '96rpx', lineHeight: '96rpx', padding: 0, fontSize: '30rpx', fontWeight: '600' }} loading={saving} onClick={handleSave}>保存</Button>
          </View>
        ) : (
          <View style={{ display: 'flex', flex: 1, gap: 'var(--space-xs)' }}>
            <Button style={{ flex: 1, background: 'var(--color-surface-2)', color: 'var(--color-brand)', borderRadius: 'var(--radius-md)', height: '96rpx', lineHeight: '96rpx', padding: 0, fontSize: '30rpx', fontWeight: '600' }} onClick={() => Taro.navigateTo({ url: `/pages/memberships/create?customerId=${customer?.id ?? ''}&customerName=${encodeURIComponent(customer?.name ?? '')}` })}>提交会员</Button>
            <Button style={{ flex: 1, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', height: '96rpx', lineHeight: '96rpx', padding: 0, fontSize: '30rpx', fontWeight: '600' }} onClick={() => { setEditing(true); setActiveTab(0); }}>编辑</Button>
          </View>
        )}
      </View>
    </View>
  );
}
