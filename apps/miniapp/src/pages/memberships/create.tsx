import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input, Button, Picker } from '@tarojs/components';
import { membershipsApi, type MemberLevel } from '../../services/memberships';

export default function MembershipCreatePage() {
  const router = useRouter();
  const { customerId, customerName } = router.params;
  const decodedName = decodeURIComponent(customerName ?? '') || '未命名客户';

  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [form, setForm] = useState({
    customerId: customerId ?? '',
    memberLevelId: '',
    fee: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    membershipsApi.getMemberLevels().then(setLevels).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.fee || !form.startDate || !form.endDate) {
      Taro.showToast({ title: '请填写会员费和有效期', icon: 'none' });
      return;
    }
    setSaving(true);
    try {
      await membershipsApi.create({
        customerId: form.customerId,
        memberLevelId: form.memberLevelId || undefined,
        fee: parseFloat(form.fee),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const levelIndex = levels.findIndex((level) => level.id === form.memberLevelId);
  const selectedLevel = levels.find((level) => level.id === form.memberLevelId)?.name;

  return (
    <View className='page page--with-actions'>
      <View className='identity-band'>
        <View className='avatar avatar--large'>{decodedName.slice(0, 1)}</View>
        <View className='identity-band__body'>
          <Text className='identity-band__eyebrow'>申请客户</Text>
          <Text className='identity-band__title'>{decodedName}</Text>
          <Text className='identity-band__meta'>提交后将进入负责人审核</Text>
        </View>
      </View>

      <View className='section-title'>
        <Text>会员信息</Text>
        <Text className='section-title__hint'>带 * 为必填项</Text>
      </View>
      <View className='surface'>
        <Picker
          mode='selector'
          range={levels.map((level) => level.name)}
          value={levelIndex >= 0 ? levelIndex : 0}
          onChange={(e) => setForm({ ...form, memberLevelId: levels[+e.detail.value]?.id ?? '' })}
        >
          <View className='field'>
            <Text className='field__label'>会员等级</Text>
            <View className={`field__value ${selectedLevel ? '' : 'field__value--empty'}`}>
              <Text>{selectedLevel || '请选择（选填）'}</Text>
              <Text className='field__arrow'>›</Text>
            </View>
          </View>
        </Picker>

        <View className='field'>
          <Text className='field__label'>会员费 <Text className='field__required'>*</Text></Text>
          <Input
            className='field__input'
            type='digit'
            placeholder='请输入金额（元）'
            value={form.fee}
            onInput={(e) => setForm({ ...form, fee: e.detail.value })}
          />
        </View>

        <Picker mode='date' value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.detail.value })}>
          <View className='field'>
            <Text className='field__label'>开始日期 <Text className='field__required'>*</Text></Text>
            <View className={`field__value ${form.startDate ? '' : 'field__value--empty'}`}>
              <Text>{form.startDate || '请选择'}</Text>
              <Text className='field__arrow'>›</Text>
            </View>
          </View>
        </Picker>

        <Picker mode='date' value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.detail.value })}>
          <View className='field'>
            <Text className='field__label'>结束日期 <Text className='field__required'>*</Text></Text>
            <View className={`field__value ${form.endDate ? '' : 'field__value--empty'}`}>
              <Text>{form.endDate || '请选择'}</Text>
              <Text className='field__arrow'>›</Text>
            </View>
          </View>
        </Picker>
      </View>

      <View className='bottom-actions'>
        <Button
          className='btn btn--primary'
          disabled={saving || undefined}
          loading={saving}
          onClick={handleSubmit}
        >
          提交申请
        </Button>
      </View>
    </View>
  );
}
