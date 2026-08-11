import { useState, useEffect } from 'react';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button, Canvas, Image } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../services/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  HEAD: '部门负责人',
  MEMBER: '部门成员',
};

function buildQRMatrix(text: string): boolean[][] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const qr = require('qrcode-generator');
  const generator = qr(0, 'M');
  generator.addData(text);
  generator.make();
  const size = generator.getModuleCount();
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (__, column) => generator.isDark(row, column))
  );
}

export default function ProfilePage() {
  const { user, logout, setAuth } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const authorized = useRequireLogin();
  const [posterSrc, setPosterSrc] = useState('');
  const [showPoster, setShowPoster] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!token) return;
    authApi.me().then((me) => {
      if (me && token) setAuth(token, me as any);
    }).catch(() => {});
  }, []);

  useShareAppMessage(() => ({
    title: `${user?.name ?? ''} 邀请您登记信息`,
    path: `/pages/register/index?shareCode=${user?.shareCode ?? ''}`,
  }));

  const handleCopyCode = () => {
    if (!user?.shareCode) return;
    Taro.setClipboardData({ data: user.shareCode });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后需要重新输入账号和密码，确认退出吗？',
      confirmColor: '#b83b3b',
      success: ({ confirm }) => {
        if (confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  const generatePoster = () => {
    if (!user?.shareCode) return;
    setGenerating(true);

    const width = 600;
    const height = 900;
    const matrix = buildQRMatrix(user.shareCode);
    const context = Taro.createCanvasContext('poster-canvas');

    // 使用纯色分区保证真机 Canvas 渲染稳定，并与小程序设计令牌保持一致。
    context.setFillStyle('#f3f5f4');
    context.fillRect(0, 0, width, height);
    context.setFillStyle('#173f3a');
    context.fillRect(0, 0, width, 292);

    context.beginPath();
    context.arc(width / 2, 106, 62, 0, Math.PI * 2);
    context.setFillStyle('rgba(255,255,255,0.14)');
    context.fill();
    context.beginPath();
    context.arc(width / 2, 106, 62, 0, Math.PI * 2);
    context.setStrokeStyle('rgba(255,255,255,0.35)');
    context.setLineWidth(3);
    context.stroke();
    context.setFillStyle('#ffffff');
    context.setFontSize(50);
    context.setTextAlign('center');
    context.setTextBaseline('middle');
    context.fillText(user.name?.[0] ?? '?', width / 2, 106);

    context.setFontSize(34);
    context.setFillStyle('#ffffff');
    context.fillText(user.name ?? '', width / 2, 194);
    context.setFontSize(22);
    context.setFillStyle('rgba(255,255,255,0.68)');
    context.fillText(ROLE_LABELS[user.role ?? ''] ?? user.role ?? '', width / 2, 236);

    context.setFillStyle('#ffffff');
    context.fillRect(32, 268, width - 64, height - 300);
    context.setFontSize(26);
    context.setFillStyle('#56615e');
    context.fillText('扫码登记客户信息', width / 2, 320);

    const qrSize = 220;
    const qrX = (width - qrSize) / 2;
    const qrY = 356;
    const moduleSize = qrSize / matrix.length;
    context.setFillStyle('#ffffff');
    context.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
    matrix.forEach((row, rowIndex) => {
      row.forEach((isDark, columnIndex) => {
        if (!isDark) return;
        context.setFillStyle('#173f3a');
        context.fillRect(
          qrX + columnIndex * moduleSize,
          qrY + rowIndex * moduleSize,
          moduleSize,
          moduleSize
        );
      });
    });

    context.setFontSize(22);
    context.setFillStyle('#89928f');
    context.fillText('分享码', width / 2, 618);
    context.setFontSize(50);
    context.setFillStyle('#176b61');
    context.fillText(user.shareCode, width / 2, 676);

    context.setStrokeStyle('#dfe5e2');
    context.setLineWidth(1);
    context.beginPath();
    context.moveTo(80, 716);
    context.lineTo(width - 80, 716);
    context.stroke();
    context.setFontSize(22);
    context.setFillStyle('#89928f');
    context.fillText('客户资源管理系统', width / 2, 756);

    context.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'poster-canvas',
        x: 0,
        y: 0,
        width,
        height,
        destWidth: width * 2,
        destHeight: height * 2,
        success: (result) => {
          setPosterSrc(result.tempFilePath);
          setShowPoster(true);
          setGenerating(false);
        },
        fail: () => {
          setGenerating(false);
          Taro.showToast({ title: '生成失败', icon: 'none' });
        },
      });
    });
  };

  const savePoster = () => {
    if (!posterSrc) return;
    Taro.saveImageToPhotosAlbum({
      filePath: posterSrc,
      success: () => Taro.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (error) => {
        if (String(error?.errMsg).includes('auth')) {
          Taro.showModal({
            title: '需要相册权限',
            content: '请在设置中允许访问相册',
            confirmText: '去设置',
            success: ({ confirm }) => { if (confirm) Taro.openSetting(); },
          });
        }
      },
    });
  };

  const navItems = [
    { title: '分成明细', desc: '查看收入、状态和结算日期', url: '/pages/commissions/list', visible: true },
    { title: '审批待办', desc: '处理入会与退款申请', url: '/pages/approvals/index', visible: user?.role === 'HEAD' || user?.role === 'ADMIN' },
  ].filter((item) => item.visible);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  return (
    <View className='page profile-page'>
      <Canvas canvasId='poster-canvas' className='poster-canvas' />

      <View className='identity-band'>
        <View className='avatar avatar--large'>{user?.name?.[0] ?? '?'}</View>
        <View className='identity-band__body'>
          <Text className='identity-band__eyebrow'>当前账号</Text>
          <Text className='identity-band__title'>{user?.name || '未命名用户'}</Text>
          <Text className='identity-band__meta'>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '角色未设置'}
          </Text>
        </View>
      </View>

      {user?.shareCode && (
        <>
          <View className='section-title'>客户邀请</View>
          <View className='surface surface--padded'>
            <View className='invite-code'>
              <View>
                <Text className='invite-code__label'>我的分享码</Text>
                <Text className='invite-code__value'>{user.shareCode}</Text>
              </View>
              <View className='invite-code__copy' onClick={handleCopyCode}>复制</View>
            </View>
            <View className='invite-actions'>
              <Button className='btn btn--primary' openType='share'>分享给客户</Button>
              <Button
                className='btn btn--secondary'
                disabled={generating || undefined}
                loading={generating}
                onClick={generatePoster}
              >
                生成邀请海报
              </Button>
            </View>
          </View>
        </>
      )}

      <View className='section-title'>业务工具</View>
      <View className='entity-list'>
        {navItems.map((item) => (
          <View
            key={item.url}
            className='entity-row'
            onClick={() => Taro.navigateTo({ url: item.url })}
          >
            <View className='entity-row__body'>
              <Text className='entity-row__title'>{item.title}</Text>
              <Text className='profile-nav__desc'>{item.desc}</Text>
            </View>
            <Text className='entity-row__arrow'>›</Text>
          </View>
        ))}
      </View>

      <View className='logout-action' onClick={handleLogout}>退出登录</View>

      {showPoster && (
        <View className='poster-mask'>
          <Image src={posterSrc} className='poster-preview' mode='widthFix' />
          <Text className='poster-mask__hint'>长按图片也可保存</Text>
          <View className='poster-actions'>
            <Button className='btn btn--primary' onClick={savePoster}>保存到相册</Button>
            <Button className='btn poster-close' onClick={() => setShowPoster(false)}>关闭</Button>
          </View>
        </View>
      )}
    </View>
  );
}
