import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input, Button, Picker, Textarea } from '@tarojs/components';
import { inviteApi, type InviterInfo, type RegisterPayload } from '../../services/invite';

const CUSTOMER_TYPES = [{ value: 'INDIVIDUAL', label: '个人' }, { value: 'COMPANY', label: '企业' }];
const GENDER_LABELS = ['男', '女', '未知'];
const GENDER_VALUES = ['MALE', 'FEMALE', 'UNKNOWN'];

const TABS = ['基本信息', '详细信息', '备注'];
const RISK_LABELS = ['保守型', '稳健型', '积极型', '激进型'];
const RISK_VALUES = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'SPECULATIVE'];

const ROW_STYLE = { display: 'flex', alignItems: 'center', padding: '28rpx 32rpx', borderBottom: '1rpx solid #f0f1f3' };
const LABEL_STYLE = { width: '160rpx', color: '#666', fontSize: '28rpx', flexShrink: 0 };
const INPUT_STYLE = { flex: 1, fontSize: '28rpx', color: '#1a1d21' };

type FormState = {
  name: string; phone: string; wechat: string; customerType: string;
  gender: string; birthday: string; address: string;
  creditCode: string; industry: string; contactName: string; contactPhone: string;
  legalPerson: string; registeredCapital: string;
  idCard: string; riskTolerance: string; isAccreditedInvestor: boolean; investmentAmount: string;
  notes: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const shareCode = router.params.shareCode ?? Taro.getStorageSync('pendingShareCode') ?? '';

  const [inviter, setInviter] = useState<InviterInfo | null>(null);
  const [inviterError, setInviterError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', wechat: '', customerType: 'INDIVIDUAL',
    gender: 'UNKNOWN', birthday: '', address: '',
    creditCode: '', industry: '', contactName: '', contactPhone: '',
    legalPerson: '', registeredCapital: '',
    idCard: '', riskTolerance: '', isAccreditedInvestor: false, investmentAmount: '',
    notes: '',
  });

  useEffect(() => {
    if (!shareCode) { setInviterError('邀请码无效，请重新扫描二维码'); return; }
    inviteApi.getInviter(shareCode).then(setInviter).catch(() => setInviterError('邀请码已失效'));
  }, [shareCode]);

  const set = (key: keyof FormState) => (e: any) => setForm({ ...form, [key]: e.detail.value });
  const typeIndex = CUSTOMER_TYPES.findIndex(t => t.value === form.customerType);
  const genderIndex = Math.max(GENDER_VALUES.indexOf(form.gender), 0);
  const riskIndex = Math.max(RISK_VALUES.indexOf(form.riskTolerance), 0);
  const isCompany = form.customerType === 'COMPANY';

  const handleSubmit = async () => {
    if (!form.name.trim()) { Taro.showToast({ title: '请填写姓名', icon: 'none' }); setActiveTab(0); return; }
    if (!/^1\d{10}$/.test(form.phone)) { Taro.showToast({ title: '请填写正确的手机号', icon: 'none' }); setActiveTab(0); return; }
    setSubmitting(true);
    try {
      const payload: RegisterPayload = {
        shareCode,
        customerType: form.customerType as 'INDIVIDUAL' | 'COMPANY',
        name: form.name.trim(),
        phone: form.phone,
        wechat: form.wechat.trim() || undefined,
        notes: form.notes.trim() || undefined,
        riskTolerance: form.riskTolerance || undefined,
        isAccreditedInvestor: form.isAccreditedInvestor,
        investmentAmount: form.investmentAmount || undefined,
        ...(!isCompany ? {
          gender: form.gender || undefined,
          birthday: form.birthday || undefined,
          address: form.address.trim() || undefined,
          idCard: form.idCard.trim() || undefined,
        } : {
          creditCode: form.creditCode.trim() || undefined,
          industry: form.industry.trim() || undefined,
          contactName: form.contactName.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          legalPerson: form.legalPerson.trim() || undefined,
          registeredCapital: form.registeredCapital.trim() || undefined,
        }),
      };
      await inviteApi.register(payload);
      Taro.removeStorageSync('pendingShareCode');
      Taro.redirectTo({ url: '/pages/register/success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '160rpx' }}>
      {/* 邀请人 */}
      <View style={{ background: '#00a3a3', padding: '48rpx 32rpx 40rpx', textAlign: 'center' }}>
        <Text style={{ color: '#fff', fontSize: '32rpx', display: 'block', marginBottom: '12rpx' }}>您受到邀请</Text>
        {inviter ? (
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '26rpx' }}>
            {inviter.inviterName}（{inviter.deptName}）邀请您登记信息
          </Text>
        ) : inviterError ? (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '26rpx' }}>{inviterError}</Text>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '26rpx' }}>验证邀请码中…</Text>
        )}
      </View>

      {!inviterError && (
        <View>
          {/* Tab 栏 */}
          <View style={{ background: '#fff', display: 'flex', borderBottom: '1rpx solid #f0f1f3', margin: '16rpx 24rpx 0', borderRadius: '12rpx 12rpx 0 0', overflow: 'hidden' }}>
            {TABS.map((tab, i) => (
              <View
                key={tab}
                style={{
                  flex: 1, textAlign: 'center', padding: '24rpx 0', fontSize: '28rpx',
                  color: activeTab === i ? '#00a3a3' : '#888',
                  borderBottom: activeTab === i ? '4rpx solid #00a3a3' : '4rpx solid transparent',
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
            <View style={{ margin: '0 24rpx', background: '#fff', borderRadius: '0 0 12rpx 12rpx', overflow: 'hidden' }}>
              <Picker mode='selector' range={CUSTOMER_TYPES.map(t => t.label)} value={typeIndex}
                onChange={(e) => setForm({ ...form, customerType: CUSTOMER_TYPES[+e.detail.value].value })}>
                <View style={ROW_STYLE}>
                  <Text style={LABEL_STYLE}>客户类型</Text>
                  <Text style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21', textAlign: 'right', marginRight: '8rpx' }}>
                    {CUSTOMER_TYPES[typeIndex]?.label}
                  </Text>
                  <Text style={{ color: '#ccc' }}>›</Text>
                </View>
              </Picker>
              <View style={ROW_STYLE}>
                <Text style={LABEL_STYLE}>{isCompany ? '企业名称' : '姓名'} <Text style={{ color: '#f5222d' }}>*</Text></Text>
                <Input style={INPUT_STYLE} placeholder={isCompany ? '请输入企业名称' : '请输入姓名'} placeholderStyle='color:#bbb'
                  maxlength={50} value={form.name} onInput={set('name')} />
              </View>
              <View style={ROW_STYLE}>
                <Text style={LABEL_STYLE}>{isCompany ? '联系电话' : '手机号'} <Text style={{ color: '#f5222d' }}>*</Text></Text>
                <Input style={INPUT_STYLE} type='number' placeholder={isCompany ? '请输入联系电话' : '请输入手机号'} placeholderStyle='color:#bbb'
                  maxlength={11} value={form.phone} onInput={set('phone')} />
              </View>
              <View style={{ ...ROW_STYLE, borderBottom: 'none' }}>
                <Text style={LABEL_STYLE}>微信号</Text>
                <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                  maxlength={64} value={form.wechat} onInput={set('wechat')} />
              </View>
            </View>
          )}

          {/* Tab 1: 详细信息（个人/企业分组） */}
          {activeTab === 1 && (
            <View style={{ margin: '0 24rpx', background: '#fff', borderRadius: '0 0 12rpx 12rpx', overflow: 'hidden' }}>
              {!isCompany && (
                <View>
                  <Picker mode='selector' range={GENDER_LABELS} value={genderIndex}
                    onChange={(e) => setForm({ ...form, gender: GENDER_VALUES[+e.detail.value] })}>
                    <View style={ROW_STYLE}>
                      <Text style={LABEL_STYLE}>性别</Text>
                      <Text style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21', textAlign: 'right', marginRight: '8rpx' }}>
                        {GENDER_LABELS[genderIndex]}
                      </Text>
                      <Text style={{ color: '#ccc' }}>›</Text>
                    </View>
                  </Picker>
                  <Picker mode='date' value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.detail.value })}>
                    <View style={ROW_STYLE}>
                      <Text style={LABEL_STYLE}>生日</Text>
                      <Text style={{ flex: 1, fontSize: '28rpx', color: form.birthday ? '#1a1d21' : '#bbb', textAlign: 'right', marginRight: '8rpx' }}>
                        {form.birthday || '选填'}
                      </Text>
                      <Text style={{ color: '#ccc' }}>›</Text>
                    </View>
                  </Picker>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>地址</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={200} value={form.address} onInput={set('address')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>身份证号</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={18} value={form.idCard} onInput={set('idCard')} />
                  </View>
                </View>
              )}
              {isCompany && (
                <View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>法人代表</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={50} value={form.legalPerson} onInput={set('legalPerson')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>注册资本</Text>
                    <Input style={INPUT_STYLE} placeholder='如：500万元' placeholderStyle='color:#bbb'
                      maxlength={50} value={form.registeredCapital} onInput={set('registeredCapital')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>统一信用代码</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={18} value={form.creditCode} onInput={set('creditCode')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>行业</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={50} value={form.industry} onInput={set('industry')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>联系人</Text>
                    <Input style={INPUT_STYLE} placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={50} value={form.contactName} onInput={set('contactName')} />
                  </View>
                  <View style={ROW_STYLE}>
                    <Text style={LABEL_STYLE}>联系手机</Text>
                    <Input style={INPUT_STYLE} type='number' placeholder='选填' placeholderStyle='color:#bbb'
                      maxlength={11} value={form.contactPhone} onInput={set('contactPhone')} />
                  </View>
                </View>
              )}
              {/* 投资信息（通用） */}
              <Picker mode='selector' range={RISK_LABELS} value={riskIndex}
                onChange={(e) => setForm({ ...form, riskTolerance: RISK_VALUES[+e.detail.value] })}>
                <View style={ROW_STYLE}>
                  <Text style={LABEL_STYLE}>风险承受能力</Text>
                  <Text style={{ flex: 1, fontSize: '28rpx', color: form.riskTolerance ? '#1a1d21' : '#bbb', textAlign: 'right', marginRight: '8rpx' }}>
                    {form.riskTolerance ? RISK_LABELS[riskIndex] : '选填'}
                  </Text>
                  <Text style={{ color: '#ccc' }}>›</Text>
                </View>
              </Picker>
              <View style={ROW_STYLE}>
                <Text style={LABEL_STYLE}>合格投资人</Text>
                <View style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '16rpx' }}>
                  {['否', '是'].map((label, i) => (
                    <View
                      key={label}
                      style={{ padding: '8rpx 24rpx', borderRadius: '999rpx', fontSize: '26rpx', background: form.isAccreditedInvestor === !!i ? '#e6f4f4' : '#f5f6f8', color: form.isAccreditedInvestor === !!i ? '#007d7d' : '#888' }}
                      onClick={() => setForm({ ...form, isAccreditedInvestor: !!i })}
                    >
                      {label}
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ ...ROW_STYLE, borderBottom: 'none' }}>
                <Text style={LABEL_STYLE}>意向投资额(万)</Text>
                <Input style={{ ...INPUT_STYLE, textAlign: 'right' }} type='digit' placeholder='选填' placeholderStyle='color:#bbb'
                  value={form.investmentAmount} onInput={set('investmentAmount')} />
              </View>
            </View>
          )}

          {/* Tab 2: 备注 */}
          {activeTab === 2 && (
            <View style={{ margin: '0 24rpx', background: '#fff', borderRadius: '0 0 12rpx 12rpx', padding: '24rpx 32rpx' }}>
              <Textarea
                style={{ width: '100%', fontSize: '28rpx', minHeight: '240rpx', color: '#1a1d21', boxSizing: 'border-box' }}
                placeholder='选填，例如：意向产品、需求说明等'
                placeholderStyle='color:#bbb'
                maxlength={500}
                value={form.notes}
                onInput={(e) => setForm({ ...form, notes: e.detail.value })}
              />
            </View>
          )}
        </View>
      )}

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '24rpx 32rpx', borderTop: '1rpx solid #f0f1f3' }}>
        <Button
          disabled={!!inviterError || submitting}
          style={{ background: inviterError ? '#ccc' : '#00a3a3', color: '#fff', borderRadius: '12rpx', fontSize: '30rpx' }}
          loading={submitting}
          onClick={handleSubmit}
        >
          提交信息
        </Button>
      </View>
    </View>
  );
}
