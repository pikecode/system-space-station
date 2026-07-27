import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

export default function RegisterSuccessPage() {
  return (
    <View style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48rpx' }}>
      <View style={{ width: '120rpx', height: '120rpx', borderRadius: '50%', background: '#e6f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40rpx' }}>
        <Text style={{ fontSize: '60rpx' }}>✓</Text>
      </View>
      <Text style={{ fontSize: '36rpx', fontWeight: '600', color: '#1a1d21', marginBottom: '16rpx' }}>
        信息已提交
      </Text>
      <Text style={{ fontSize: '28rpx', color: '#86909c', textAlign: 'center', lineHeight: '1.6' }}>
        您的信息已成功登记，邀请人将会与您联系，请保持手机畅通。
      </Text>
      <Button
        style={{ marginTop: '64rpx', background: '#00a3a3', color: '#fff', borderRadius: '12rpx', fontSize: '30rpx', width: '480rpx' }}
        onClick={() => Taro.reLaunch({ url: '/pages/login/index' })}
      >
        返回首页
      </Button>
    </View>
  );
}
