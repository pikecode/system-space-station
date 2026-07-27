import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Input, Button, Picker } from '@tarojs/components';
import { inviteApi, type InviterInfo } from '../../services/invite';

const CUSTOMER_TYPES = [
  { value: 'INDIVIDUAL', label: '个人' },
  { value: 'COMPANY', label: '企业' },
];

export default function RegisterPage() {
  const router = useRouter();
  const shareCode = router.params.shareCode ?? Taro.getStorageSync('pendingShareCode') ?? '';

  const [inviter, setInviter] = useState<InviterInfo | null>(null);
  const [inviterError, setInviterError] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', wechat: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setInviterError('邀请码无效，请重新扫描二维码');
      return;
    }
    inviteApi.getInviter(shareCode)
      .then(setInviter)
      .catch(() => setInviterError('邀请码已失效'));
  }, [shareCode]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' }); return;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' }); return;
    }
    setSubmitting(true);
    try {
      await inviteApi.register({
        shareCode,
        customerType: CUSTOMER_TYPES[typeIndex].value as 'INDIVIDUAL' | 'COMPANY',
        name: form.name.trim(),
        phone: form.phone,
        wechat: form.wechat.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
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
      {/* 邀请人信息 */}
      <View style={{ background: '#00a3a3', padding: '48rpx 32rpx 40rpx', textAlign: 'center' }}>
        <Text style={{ color: '#fff', fontSize: '32rpx', display: 'block', marginBottom: '12rpx' }}>
          您受到邀请
        </Text>
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
        <View style={{ margin: '24rpx 24rpx 0', background: '#fff', borderRadius: '16rpx', overflow: 'hidden' }}>
          <View style={{ padding: '32rpx 32rpx 0' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#1a1d21' }}>填写您的信息</Text>
          </View>

          {/* 客户类型 */}
          <Picker
            mode='selector'
            range={CUSTOMER_TYPES.map((t) => t.label)}
            value={typeIndex}
            onChange={(e) => setTypeIndex(+e.detail.value)}
          >
            <View style={{ display: 'flex', alignItems: 'center', padding: '28rpx 32rpx', borderBottom: '1rpx solid #f0f1f3' }}>
              <Text style={{ flex: 1, color: '#666', fontSize: '28rpx' }}>客户类型</Text>
              <Text style={{ color: '#1a1d21', fontSize: '28rpx', marginRight: '12rpx' }}>
                {CUSTOMER_TYPES[typeIndex].label}
              </Text>
              <Text style={{ color: '#ccc', fontSize: '24rpx' }}>›</Text>
            </View>
          </Picker>

          {/* 姓名 */}
          <View style={{ display: 'flex', alignItems: 'center', padding: '28rpx 32rpx', borderBottom: '1rpx solid #f0f1f3' }}>
            <Text style={{ width: '140rpx', color: '#666', fontSize: '28rpx', flexShrink: 0 }}>
              姓名 <Text style={{ color: '#f5222d' }}>*</Text>
            </Text>
            <Input
              style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21' }}
              placeholder='请输入姓名'
              placeholderStyle='color:#bbb'
              maxlength={50}
              value={form.name}
              onInput={(e) => setForm({ ...form, name: e.detail.value })}
            />
          </View>

          {/* 手机号 */}
          <View style={{ display: 'flex', alignItems: 'center', padding: '28rpx 32rpx', borderBottom: '1rpx solid #f0f1f3' }}>
            <Text style={{ width: '140rpx', color: '#666', fontSize: '28rpx', flexShrink: 0 }}>
              手机号 <Text style={{ color: '#f5222d' }}>*</Text>
            </Text>
            <Input
              style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21' }}
              type='number'
              placeholder='请输入手机号'
              placeholderStyle='color:#bbb'
              maxlength={11}
              value={form.phone}
              onInput={(e) => setForm({ ...form, phone: e.detail.value })}
            />
          </View>

          {/* 微信号 */}
          <View style={{ display: 'flex', alignItems: 'center', padding: '28rpx 32rpx', borderBottom: '1rpx solid #f0f1f3' }}>
            <Text style={{ width: '140rpx', color: '#666', fontSize: '28rpx', flexShrink: 0 }}>微信号</Text>
            <Input
              style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21' }}
              placeholder='选填'
              placeholderStyle='color:#bbb'
              maxlength={64}
              value={form.wechat}
              onInput={(e) => setForm({ ...form, wechat: e.detail.value })}
            />
          </View>

          {/* 备注 */}
          <View style={{ display: 'flex', alignItems: 'flex-start', padding: '28rpx 32rpx' }}>
            <Text style={{ width: '140rpx', color: '#666', fontSize: '28rpx', flexShrink: 0, paddingTop: '4rpx' }}>备注</Text>
            <Input
              style={{ flex: 1, fontSize: '28rpx', color: '#1a1d21' }}
              placeholder='选填，例如：意向产品或需求说明'
              placeholderStyle='color:#bbb'
              maxlength={200}
              value={form.notes}
              onInput={(e) => setForm({ ...form, notes: e.detail.value })}
            />
          </View>
        </View>
      )}

      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '24rpx 32rpx', borderTop: '1rpx solid #f0f1f3' }}>
        <Button
          disabled={!!inviterError || submitting}
          style={{
            background: inviterError ? '#ccc' : '#00a3a3',
            color: '#fff',
            borderRadius: '12rpx',
            fontSize: '30rpx',
          }}
          loading={submitting}
          onClick={handleSubmit}
        >
          提交信息
        </Button>
      </View>
    </View>
  );
}
