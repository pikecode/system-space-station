import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input, Button, Picker, Textarea } from '@tarojs/components';
import type { CustomerType, Gender, RiskTolerance } from 'shared';
import { inviteApi, type InviterInfo, type RegisterPayload } from '../../services/invite';

const CUSTOMER_TYPES = [
  { value: 'INDIVIDUAL', label: '个人' },
  { value: 'COMPANY', label: '企业' },
];
const GENDER_LABELS = ['男', '女', '未知'];
const GENDER_VALUES = ['MALE', 'FEMALE', 'UNKNOWN'];
const TABS = ['基本信息', '详细信息', '备注'];
const RISK_LABELS = ['保守型', '稳健型', '积极型', '激进型'];
const RISK_VALUES = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'SPECULATIVE'];

type FormState = {
  name: string;
  phone: string;
  wechat: string;
  customerType: string;
  gender: string;
  birthday: string;
  address: string;
  creditCode: string;
  industry: string;
  contactName: string;
  contactPhone: string;
  legalPerson: string;
  registeredCapital: string;
  idCard: string;
  riskTolerance: string;
  isAccreditedInvestor: boolean;
  investmentAmount: string;
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
    name: '',
    phone: '',
    wechat: '',
    customerType: 'INDIVIDUAL',
    gender: 'UNKNOWN',
    birthday: '',
    address: '',
    creditCode: '',
    industry: '',
    contactName: '',
    contactPhone: '',
    legalPerson: '',
    registeredCapital: '',
    idCard: '',
    riskTolerance: '',
    isAccreditedInvestor: false,
    investmentAmount: '',
    notes: '',
  });

  useEffect(() => {
    if (!shareCode) {
      setInviterError('邀请码无效，请重新扫描二维码');
      return;
    }
    inviteApi.getInviter(shareCode)
      .then(setInviter)
      .catch(() => setInviterError('邀请码已失效'));
  }, [shareCode]);

  const set = (key: keyof FormState) => (event: any) => {
    setForm({ ...form, [key]: event.detail.value });
  };
  const genderIndex = Math.max(GENDER_VALUES.indexOf(form.gender), 0);
  const riskIndex = Math.max(RISK_VALUES.indexOf(form.riskTolerance), 0);
  const isCompany = form.customerType === 'COMPANY';

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: `请填写${isCompany ? '企业名称' : '姓名'}`, icon: 'none' });
      setActiveTab(0);
      return;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      Taro.showToast({ title: '请填写正确的手机号', icon: 'none' });
      setActiveTab(0);
      return;
    }
    setSubmitting(true);
    try {
      const payload: RegisterPayload = {
        shareCode,
        customerType: form.customerType as CustomerType,
        name: form.name.trim(),
        phone: form.phone,
        wechat: form.wechat.trim() || undefined,
        notes: form.notes.trim() || undefined,
        riskTolerance: (form.riskTolerance || undefined) as RiskTolerance | undefined,
        isAccreditedInvestor: form.isAccreditedInvestor,
        investmentAmount: form.investmentAmount || undefined,
        ...(!isCompany ? {
          gender: (form.gender || undefined) as Gender | undefined,
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
    <View className={`page ${inviterError ? '' : 'page--with-actions'}`}>
      <View className='identity-band register-context'>
        <View className='avatar avatar--large'>{inviter?.inviterName?.slice(0, 1) || '客'}</View>
        <View className='identity-band__body'>
          <Text className='identity-band__eyebrow'>客户资源管理</Text>
          <Text className='identity-band__title'>客户信息登记</Text>
          <Text className='identity-band__meta'>
            {inviter
              ? `${inviter.inviterName} · ${inviter.deptName}`
              : inviterError || '正在验证邀请信息...'}
          </Text>
        </View>
      </View>

      {inviterError ? (
        <View className='status-panel'>
          <View className='status-panel__mark'>!</View>
          <Text className='status-panel__title'>邀请链接不可用</Text>
          <Text className='status-panel__desc'>{inviterError}</Text>
        </View>
      ) : (
        <>
          <View className='form-tabs'>
            {TABS.map((tab, index) => (
              <View
                key={tab}
                className={`form-tabs__item ${activeTab === index ? 'form-tabs__item--active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </View>
            ))}
          </View>

          {activeTab === 0 && (
            <>
              <View className='section-title'>联系信息</View>
              <View className='surface'>
                <View className='field'>
                  <Text className='field__label'>客户类型</Text>
                  <View className='binary-control'>
                    {CUSTOMER_TYPES.map((type) => (
                      <View
                        key={type.value}
                        className={`binary-control__item ${form.customerType === type.value ? 'binary-control__item--active' : ''}`}
                        onClick={() => setForm({ ...form, customerType: type.value })}
                      >
                        {type.label}
                      </View>
                    ))}
                  </View>
                </View>
                <View className='field'>
                  <Text className='field__label'>
                    {isCompany ? '企业名称' : '姓名'} <Text className='field__required'>*</Text>
                  </Text>
                  <Input
                    className='field__input'
                    placeholder={isCompany ? '请输入企业名称' : '请输入姓名'}
                    maxlength={50}
                    value={form.name}
                    onInput={set('name')}
                  />
                </View>
                <View className='field'>
                  <Text className='field__label'>
                    {isCompany ? '联系电话' : '手机号'} <Text className='field__required'>*</Text>
                  </Text>
                  <Input
                    className='field__input'
                    type='number'
                    placeholder='请输入手机号'
                    maxlength={11}
                    value={form.phone}
                    onInput={set('phone')}
                  />
                </View>
                <View className='field'>
                  <Text className='field__label'>微信号</Text>
                  <Input
                    className='field__input'
                    placeholder='选填'
                    maxlength={64}
                    value={form.wechat}
                    onInput={set('wechat')}
                  />
                </View>
              </View>
            </>
          )}

          {activeTab === 1 && (
            <>
              <View className='section-title'>{isCompany ? '企业资料' : '个人资料'}</View>
              <View className='surface'>
                {!isCompany ? (
                  <>
                    <Picker
                      mode='selector'
                      range={GENDER_LABELS}
                      value={genderIndex}
                      onChange={(e) => setForm({ ...form, gender: GENDER_VALUES[+e.detail.value] })}
                    >
                      <View className='field'>
                        <Text className='field__label'>性别</Text>
                        <View className='field__value'>
                          <Text>{GENDER_LABELS[genderIndex]}</Text>
                          <Text className='field__arrow'>›</Text>
                        </View>
                      </View>
                    </Picker>
                    <Picker
                      mode='date'
                      value={form.birthday}
                      onChange={(e) => setForm({ ...form, birthday: e.detail.value })}
                    >
                      <View className='field'>
                        <Text className='field__label'>生日</Text>
                        <View className={`field__value ${form.birthday ? '' : 'field__value--empty'}`}>
                          <Text>{form.birthday || '选填'}</Text>
                          <Text className='field__arrow'>›</Text>
                        </View>
                      </View>
                    </Picker>
                    <View className='field'>
                      <Text className='field__label'>地址</Text>
                      <Input className='field__input' placeholder='选填' maxlength={200} value={form.address} onInput={set('address')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>身份证号</Text>
                      <Input className='field__input' placeholder='选填' maxlength={18} value={form.idCard} onInput={set('idCard')} />
                    </View>
                  </>
                ) : (
                  <>
                    <View className='field'>
                      <Text className='field__label'>法人代表</Text>
                      <Input className='field__input' placeholder='选填' maxlength={50} value={form.legalPerson} onInput={set('legalPerson')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>注册资本</Text>
                      <Input className='field__input' placeholder='如：500万元' maxlength={50} value={form.registeredCapital} onInput={set('registeredCapital')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>统一信用代码</Text>
                      <Input className='field__input' placeholder='选填' maxlength={18} value={form.creditCode} onInput={set('creditCode')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>行业</Text>
                      <Input className='field__input' placeholder='选填' maxlength={50} value={form.industry} onInput={set('industry')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>联系人</Text>
                      <Input className='field__input' placeholder='选填' maxlength={50} value={form.contactName} onInput={set('contactName')} />
                    </View>
                    <View className='field'>
                      <Text className='field__label'>联系手机</Text>
                      <Input className='field__input' type='number' placeholder='选填' maxlength={11} value={form.contactPhone} onInput={set('contactPhone')} />
                    </View>
                  </>
                )}
              </View>

              <View className='section-title'>投资偏好</View>
              <View className='surface'>
                <Picker
                  mode='selector'
                  range={RISK_LABELS}
                  value={riskIndex}
                  onChange={(e) => setForm({ ...form, riskTolerance: RISK_VALUES[+e.detail.value] })}
                >
                  <View className='field'>
                    <Text className='field__label'>风险承受能力</Text>
                    <View className={`field__value ${form.riskTolerance ? '' : 'field__value--empty'}`}>
                      <Text>{form.riskTolerance ? RISK_LABELS[riskIndex] : '选填'}</Text>
                      <Text className='field__arrow'>›</Text>
                    </View>
                  </View>
                </Picker>
                <View className='field'>
                  <Text className='field__label'>合格投资人</Text>
                  <View className='binary-control'>
                    {['否', '是'].map((label, index) => (
                      <View
                        key={label}
                        className={`binary-control__item ${form.isAccreditedInvestor === Boolean(index) ? 'binary-control__item--active' : ''}`}
                        onClick={() => setForm({ ...form, isAccreditedInvestor: Boolean(index) })}
                      >
                        {label}
                      </View>
                    ))}
                  </View>
                </View>
                <View className='field'>
                  <Text className='field__label'>意向投资额</Text>
                  <Input
                    className='field__input'
                    type='digit'
                    placeholder='选填，单位万元'
                    value={form.investmentAmount}
                    onInput={set('investmentAmount')}
                  />
                </View>
              </View>
            </>
          )}

          {activeTab === 2 && (
            <>
              <View className='section-title'>补充说明</View>
              <View className='surface surface--padded'>
                <Textarea
                  className='textarea-field'
                  placeholder='选填，例如意向产品、需求说明等'
                  maxlength={500}
                  value={form.notes}
                  onInput={(e) => setForm({ ...form, notes: e.detail.value })}
                />
              </View>
            </>
          )}

          <View className='page-tail-space' />
          <View className='bottom-actions'>
            <Button
              className='btn btn--primary'
              disabled={!inviter || submitting || undefined}
              loading={submitting}
              onClick={handleSubmit}
            >
              {inviter ? '提交信息' : '验证邀请信息中'}
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
