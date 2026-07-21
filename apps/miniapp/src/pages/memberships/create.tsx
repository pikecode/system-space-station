import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input, Button, Picker } from '@tarojs/components';
import { membershipsApi, type MemberLevel } from '../../services/memberships';

export default function MembershipCreatePage() {
  const router = useRouter();
  const { customerId, customerName } = router.params;

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
      Taro.showToast({ title: '请填写会员费和有效期', icon: 'none' }); return;
    }
    setSaving(true);
    try {
      await membershipsApi.create({
        customerId: form.customerId,
        memberLevelId: form.memberLevelId || undefined,
        fee: form.fee,
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

  const levelIndex = levels.findIndex((l) => l.id === form.memberLevelId);

  return (
    <View className='page' style={{ paddingBottom: '160rpx' }}>
      <View className='section-title'>客户</View>
      <View className='field'>
        <Text className='field__label'>客户姓名</Text>
        <Text style={{ fontSize: '30rpx', color: '#1a1d21' }}>{customerName}</Text>
      </View>

      <View className='section-title'>会员信息</View>
      <Picker
        mode='selector'
        range={levels.map((l) => l.name)}
        value={levelIndex >= 0 ? levelIndex : 0}
        onChange={(e) => setForm({ ...form, memberLevelId: levels[+e.detail.value]?.id ?? '' })}
      >
        <View className='field'>
          <Text className='field__label'>会员等级</Text>
          <Text style={{ fontSize: '30rpx', color: form.memberLevelId ? '#1a1d21' : '#bbb' }}>
            {form.memberLevelId ? levels.find(l => l.id === form.memberLevelId)?.name : '请选择（选填）'}
          </Text>
        </View>
      </Picker>

      <View className='field'>
        <Text className='field__label'>会员费（元）</Text>
        <Input
          className='field__input'
          type='digit'
          placeholder='请输入金额'
          value={form.fee}
          onInput={(e) => setForm({ ...form, fee: e.detail.value })}
        />
      </View>

      <Picker mode='date' value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.detail.value })}>
        <View className='field'>
          <Text className='field__label'>开始日期</Text>
          <Text style={{ fontSize: '30rpx', color: form.startDate ? '#1a1d21' : '#bbb' }}>
            {form.startDate || '请选择'}
          </Text>
        </View>
      </Picker>

      <Picker mode='date' value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.detail.value })}>
        <View className='field'>
          <Text className='field__label'>结束日期</Text>
          <Text style={{ fontSize: '30rpx', color: form.endDate ? '#1a1d21' : '#bbb' }}>
            {form.endDate || '请选择'}
          </Text>
        </View>
      </Picker>

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '24rpx 32rpx', borderTop: '1rpx solid #f0f1f3' }}>
        <Button
          style={{ background: '#00a3a3', color: '#fff', borderRadius: '12rpx' }}
          loading={saving}
          onClick={handleSubmit}
        >
          提交申请
        </Button>
      </View>
    </View>
  );
}
