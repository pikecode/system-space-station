import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

export default function RegisterSuccessPage() {
  return (
    <View className='page result-page'>
      <View className='result-content'>
        <View className='result-mark'>✓</View>
        <Text className='result-title'>信息已提交</Text>
        <Text className='result-desc'>
          登记信息已交给邀请人，请保持手机畅通，后续联系无需重复提交。
        </Text>
        <Button
          className='btn btn--primary result-button'
          onClick={() => Taro.reLaunch({ url: '/pages/login/index' })}
        >
          完成
        </Button>
      </View>
    </View>
  );
}
