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
  PROSPECT: '意向会员', ACTIVE_MEMBER: '正式会员', ACTIVE: '正常', INACTIVE: '停用',
  PENDING: '待审核', APPROVED: '有效', REJECTED: '已拒绝',
  PAID: '已缴费', EXPIRED: '已到期', REFUND_PENDING: '退款中', REFUNDED: '已退款',
};
const STATUS_CLASS: Record<string, string> = {
  PROSPECT: 'tag--pending', ACTIVE_MEMBER: 'tag--approved', ACTIVE: 'tag--approved', INACTIVE: 'tag--expired',
  PENDING: 'tag--pending', APPROVED: 'tag--approved', REJECTED: 'tag--rejected',
  PAID: 'tag--approved', EXPIRED: 'tag--expired', REFUND_PENDING: 'tag--pending', REFUNDED: 'tag--expired',
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

type InfoItem = { label: string; value?: string | number | null };

function InfoSection({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <>
      <View className='section-title'>{title}</View>
      <View className='surface'>
        {items.map(({ label, value }) => {
          const empty = value === undefined || value === null || value === '';
          return (
            <View key={label} className='row'>
              <Text className='row__label'>{label}</Text>
              <Text className={`row__value ${empty ? 'row__value--empty' : ''}`}>{empty ? '-' : value}</Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id, mode } = router.params;
  const isCreate = mode === 'create';
  const user = useAuthStore((s) => s.user);
  const authorized = useRequireLogin();
  const writable = user?.canWriteCustomer === true;

  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [editing, setEditing] = useState(isCreate && writable);
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
          isAccreditedInvestor: data.isAccreditedInvestor ?? false,
          investmentAmount: data.investmentAmount ?? '',
        });
        setLoading(false);
      }).catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' });
        setLoading(false);
      });
    }
  }, [authorized, id, isCreate]);

  const handleSave = async () => {
    if (!writable) {
      Taro.showToast({ title: '当前账号仅可查看', icon: 'none' });
      return;
    }
    if (!form.name.trim()) {
      Taro.showToast({ title: '请填写姓名', icon: 'none' });
      setActiveTab(0);
      return;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      Taro.showToast({ title: '请填写正确的手机号', icon: 'none' });
      setActiveTab(0);
      return;
    }
    if (isCreate && !form.shareCode.trim()) {
      Taro.showToast({ title: '请填写分享码', icon: 'none' });
      setActiveTab(0);
      return;
    }
    setSaving(true);
    const isCompany = form.customerType === 'COMPANY';
    const typeFields = !isCompany
      ? {
        gender: (form.gender || undefined) as Gender | undefined,
        birthday: form.birthday || undefined,
        address: form.address.trim() || undefined,
        idCard: form.idCard.trim() || undefined,
      }
      : {
        creditCode: form.creditCode.trim() || undefined,
        industry: form.industry.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        legalPerson: form.legalPerson.trim() || undefined,
        registeredCapital: form.registeredCapital.trim() || undefined,
      };
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
          customerType: form.customerType as CustomerType,
          source: form.source as CustomerSource,
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
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof FormState) => (e: any) => setForm({ ...form, [key]: e.detail.value });
  const typeIndex = Math.max(CUSTOMER_TYPE_VALUES.indexOf(form.customerType), 0);
  const sourceIndex = Math.max(SOURCE_OPTIONS.findIndex((source) => source.value === form.source), 0);
  const genderIndex = Math.max(GENDER_VALUES.indexOf(form.gender), 0);
  const riskIndex = Math.max(RISK_VALUES.indexOf(form.riskTolerance), 0);
  const isCompanyForm = form.customerType === 'COMPANY';

  if (!authorized) return <View className='loading'>跳转登录中...</View>;
  if (loading) return <View className='loading'>加载中...</View>;
  if (isCreate && !writable) {
    return <View className='loading'>当前账号仅可查看客户</View>;
  }

  return (
    <View className='page page--with-actions'>
      <ScrollView scrollY className='page-scroll'>
        {editing ? (
          <View className='page--with-actions'>
            <View className='segmented'>
              {EDIT_TABS.map((tab, index) => (
                <View
                  key={tab}
                  className={`segmented__item ${activeTab === index ? 'segmented__item--active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </View>
              ))}
            </View>

            {activeTab === 0 && (
              <>
                <View className='section-title'>客户识别</View>
                <View className='surface'>
                  {isCreate && (
                    <View className='field'>
                      <Text className='field__label'>分享码 <Text className='field__required'>*</Text></Text>
                      <Input className='field__input' placeholder='请输入分享码' placeholderStyle='color:#89928f'
                        value={form.shareCode} onInput={set('shareCode')} />
                    </View>
                  )}
                  <Picker mode='selector' range={CUSTOMER_TYPE_LABELS} value={typeIndex}
                    onChange={(e) => setForm({ ...form, customerType: CUSTOMER_TYPE_VALUES[+e.detail.value] })}>
                    <View className='field'>
                      <Text className='field__label'>客户类型 <Text className='field__required'>*</Text></Text>
                      <View className='field__value'>{CUSTOMER_TYPE_LABELS[typeIndex]}<Text className='field__arrow'>›</Text></View>
                    </View>
                  </Picker>
                  <Picker mode='selector' range={SOURCE_OPTIONS.map((source) => source.label)} value={sourceIndex}
                    onChange={(e) => setForm({ ...form, source: SOURCE_OPTIONS[+e.detail.value].value })}>
                    <View className='field'>
                      <Text className='field__label'>客户来源</Text>
                      <View className='field__value'>{SOURCE_OPTIONS[sourceIndex]?.label}<Text className='field__arrow'>›</Text></View>
                    </View>
                  </Picker>
                  <View className='field'>
                    <Text className='field__label'>{isCompanyForm ? '企业名称' : '姓名'} <Text className='field__required'>*</Text></Text>
                    <Input className='field__input' placeholder={isCompanyForm ? '请输入企业名称' : '请输入姓名'} placeholderStyle='color:#89928f'
                      maxlength={50} value={form.name} onInput={set('name')} />
                  </View>
                  <View className='field'>
                    <Text className='field__label'>{isCompanyForm ? '联系电话' : '手机号'} <Text className='field__required'>*</Text></Text>
                    <Input className='field__input' type='number' placeholder='请输入号码' placeholderStyle='color:#89928f'
                      maxlength={11} value={form.phone} onInput={set('phone')} />
                  </View>
                  <View className='field'>
                    <Text className='field__label'>微信号</Text>
                    <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                      maxlength={64} value={form.wechat} onInput={set('wechat')} />
                  </View>
                  {isCompanyForm ? (
                    <View className='field'>
                      <Text className='field__label'>法人代表</Text>
                      <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                        maxlength={50} value={form.legalPerson} onInput={set('legalPerson')} />
                    </View>
                  ) : (
                    <View className='field'>
                      <Text className='field__label'>身份证号</Text>
                      <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                        maxlength={18} value={form.idCard} onInput={set('idCard')} />
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === 1 && (
              <>
                <View className='section-title'>{isCompanyForm ? '企业资料' : '个人资料'}</View>
                <View className='surface'>
                  {!isCompanyForm ? (
                    <>
                      <Picker mode='selector' range={GENDER_LABELS} value={genderIndex}
                        onChange={(e) => setForm({ ...form, gender: GENDER_VALUES[+e.detail.value] })}>
                        <View className='field'>
                          <Text className='field__label'>性别</Text>
                          <View className='field__value'>{GENDER_LABELS[genderIndex]}<Text className='field__arrow'>›</Text></View>
                        </View>
                      </Picker>
                      <Picker mode='date' value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.detail.value })}>
                        <View className='field'>
                          <Text className='field__label'>生日</Text>
                          <View className={`field__value ${form.birthday ? '' : 'field__value--empty'}`}>
                            {form.birthday || '选填'}<Text className='field__arrow'>›</Text>
                          </View>
                        </View>
                      </Picker>
                      <View className='field'>
                        <Text className='field__label'>地址</Text>
                        <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                          maxlength={200} value={form.address} onInput={set('address')} />
                      </View>
                    </>
                  ) : (
                    <>
                      <View className='field'>
                        <Text className='field__label'>统一信用代码</Text>
                        <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                          maxlength={18} value={form.creditCode} onInput={set('creditCode')} />
                      </View>
                      <View className='field'>
                        <Text className='field__label'>注册资本</Text>
                        <Input className='field__input' placeholder='如：500万元' placeholderStyle='color:#89928f'
                          maxlength={50} value={form.registeredCapital} onInput={set('registeredCapital')} />
                      </View>
                      <View className='field'>
                        <Text className='field__label'>行业</Text>
                        <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                          maxlength={50} value={form.industry} onInput={set('industry')} />
                      </View>
                      <View className='field'>
                        <Text className='field__label'>联系人姓名</Text>
                        <Input className='field__input' placeholder='选填' placeholderStyle='color:#89928f'
                          maxlength={50} value={form.contactName} onInput={set('contactName')} />
                      </View>
                      <View className='field'>
                        <Text className='field__label'>联系人手机</Text>
                        <Input className='field__input' type='number' placeholder='选填' placeholderStyle='color:#89928f'
                          maxlength={11} value={form.contactPhone} onInput={set('contactPhone')} />
                      </View>
                    </>
                  )}
                </View>

                <View className='section-title'>投资偏好</View>
                <View className='surface'>
                  <Picker mode='selector' range={RISK_LABELS} value={riskIndex}
                    onChange={(e) => setForm({ ...form, riskTolerance: RISK_VALUES[+e.detail.value] })}>
                    <View className='field'>
                      <Text className='field__label'>风险承受能力</Text>
                      <View className={`field__value ${form.riskTolerance ? '' : 'field__value--empty'}`}>
                        {form.riskTolerance ? RISK_LABELS[riskIndex] : '选填'}<Text className='field__arrow'>›</Text>
                      </View>
                    </View>
                  </Picker>
                  <View className='field'>
                    <Text className='field__label'>合格投资人</Text>
                    <View className='binary-control'>
                      {['否', '是'].map((label, index) => (
                        <View
                          key={label}
                          className={`binary-control__item ${form.isAccreditedInvestor === !!index ? 'binary-control__item--active' : ''}`}
                          onClick={() => setForm({ ...form, isAccreditedInvestor: !!index })}
                        >
                          {label}
                        </View>
                      ))}
                    </View>
                  </View>
                  <View className='field'>
                    <Text className='field__label'>意向投资额（万）</Text>
                    <Input className='field__input' type='digit' placeholder='选填' placeholderStyle='color:#89928f'
                      value={form.investmentAmount} onInput={set('investmentAmount')} />
                  </View>
                </View>
              </>
            )}

            {activeTab === 2 && (
              <>
                <View className='section-title'>客户标签</View>
                <View className='surface'>
                  <View className='field'>
                    <Text className='field__label'>标签</Text>
                    <Input className='field__input' placeholder='多个标签用逗号分隔' placeholderStyle='color:#89928f'
                      value={form.tags} onInput={set('tags')} />
                  </View>
                </View>
                <View className='section-title'>业务备注</View>
                <View className='surface surface--padded'>
                  <Textarea className='textarea-field' placeholder='记录客户需求、意向产品等' placeholderStyle='color:#89928f'
                    maxlength={500} value={form.notes}
                    onInput={(e) => setForm({ ...form, notes: e.detail.value })} />
                </View>
              </>
            )}
          </View>
        ) : (
          <View className='page--with-actions'>
            <View className='identity-band'>
              <View className='avatar avatar--large'>{customer?.name?.[0] ?? '?'}</View>
              <View className='identity-band__body'>
                <Text className='identity-band__title'>{customer?.name}</Text>
                <Text className='identity-band__meta'>
                  {customer?.customerType === 'INDIVIDUAL' ? '个人客户' : '企业客户'}
                  {customer?.registrationSource ? ` · ${REG_SOURCE_LABELS[customer.registrationSource] ?? customer.registrationSource}` : ''}
                </Text>
              </View>
              {customer?.status && (
                <Text className={`tag ${STATUS_CLASS[customer.status] ?? 'tag--neutral'}`}>
                  {STATUS_LABELS[customer.status] ?? customer.status}
                </Text>
              )}
            </View>

            <InfoSection title='基本信息' items={[
              { label: customer?.customerType === 'COMPANY' ? '联系电话' : '手机号', value: customer?.phone },
              { label: '微信号', value: customer?.wechat },
              { label: '来源', value: SOURCE_OPTIONS.find((source) => source.value === customer?.source)?.label },
              { label: '负责人', value: customer?.assignedUser?.name },
              { label: '所属部门', value: customer?.department?.name },
              { label: '标签', value: customer?.tags },
            ]} />

            {customer?.customerType === 'INDIVIDUAL' ? (
              <InfoSection title='个人资料' items={[
                { label: '身份证号', value: customer?.idCard },
                { label: '性别', value: customer?.gender ? GENDER_LABELS[GENDER_VALUES.indexOf(customer.gender)] : undefined },
                { label: '生日', value: customer?.birthday?.slice(0, 10) },
                { label: '地址', value: customer?.address },
              ]} />
            ) : (
              <InfoSection title='企业资料' items={[
                { label: '法人代表', value: customer?.legalPerson },
                { label: '统一信用代码', value: customer?.creditCode },
                { label: '注册资本', value: customer?.registeredCapital },
                { label: '行业', value: customer?.industry },
                { label: '联系人', value: customer?.contactName },
                { label: '联系手机', value: customer?.contactPhone },
              ]} />
            )}

            <InfoSection title='投资偏好' items={[
              { label: '风险承受能力', value: customer?.riskTolerance ? RISK_LABELS[RISK_VALUES.indexOf(customer.riskTolerance)] : undefined },
              { label: '合格投资人', value: customer?.isAccreditedInvestor != null ? (customer.isAccreditedInvestor ? '是' : '否') : undefined },
              { label: '意向投资额（万）', value: customer?.investmentAmount },
            ]} />

            {!!customer?.memberships?.length && (
              <>
                <View className='section-title'>会员记录</View>
                <View className='entity-list'>
                  {customer.memberships.map((membership) => (
                    <View key={membership.id} className='entity-row'
                      onClick={() => Taro.navigateTo({ url: `/pages/memberships/detail?id=${membership.id}` })}>
                      <View className='entity-row__body'>
                        <View className='entity-row__top'>
                          <Text className='entity-row__title'>{membership.memberLevel?.name ?? '会员申请'}</Text>
                          <Text className={`tag ${STATUS_CLASS[membership.status] ?? 'tag--neutral'}`}>
                            {STATUS_LABELS[membership.status] ?? membership.status}
                          </Text>
                        </View>
                        <Text className='entity-row__meta'>{membership.startDate?.slice(0, 10)} 至 {membership.endDate?.slice(0, 10)}</Text>
                      </View>
                      <Text className='entity-row__arrow'>›</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View className='section-title'>备注</View>
            <View className='surface surface--padded'>
              <Text className={customer?.notes ? 'note-text' : 'note-text note-text--empty'}>
                {customer?.notes || '暂无备注'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className='bottom-actions'>
        {editing ? (
          <>
            {!isCreate && (
              <Button className='btn btn--quiet' onClick={() => { setEditing(false); setActiveTab(0); }}>取消</Button>
            )}
            <Button className='btn btn--primary' loading={saving} disabled={saving || undefined} onClick={handleSave}>保存</Button>
          </>
        ) : writable ? (
          <>
            <Button className='btn btn--secondary'
              onClick={() => Taro.navigateTo({ url: `/pages/memberships/create?customerId=${customer?.id ?? ''}&customerName=${encodeURIComponent(customer?.name ?? '')}` })}>
              提交会员
            </Button>
            <Button className='btn btn--primary' onClick={() => { setEditing(true); setActiveTab(0); }}>编辑</Button>
          </>
        ) : (
          <Button className='btn btn--quiet' disabled>仅可查看</Button>
        )}
      </View>
    </View>
  );
}
