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

    const W = 600;
    const H = 900;
    const matrix = buildQRMatrix(user.shareCode);
    const ctx = Taro.createCanvasContext('poster-canvas');

    // ── 背景 ──────────────────────────────────────
    ctx.setFillStyle('#f4f7fa');
    ctx.fillRect(0, 0, W, H);

    // ── 头部渐变（两段矩形模拟渐变）─────────────────
    ctx.setFillStyle('#0a4f5e');
    ctx.fillRect(0, 0, W, 200);
    ctx.setFillStyle('#086070');
    ctx.fillRect(0, 200, W, 60);
    ctx.setFillStyle('#007d7d');
    ctx.fillRect(0, 240, W, 60);

    // ── 头像圆圈 ─────────────────────────────────
    ctx.beginPath();
    ctx.arc(W / 2, 118, 72, 0, Math.PI * 2);
    ctx.setFillStyle('rgba(255,255,255,0.15)');
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W / 2, 118, 72, 0, Math.PI * 2);
    ctx.setStrokeStyle('rgba(255,255,255,0.4)');
    ctx.setLineWidth(3);
    ctx.stroke();
    ctx.setFillStyle('#ffffff');
    ctx.setFontSize(56);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.fillText(user.name?.[0] ?? '?', W / 2, 118);

    // ── 姓名 & 角色 ───────────────────────────────
    ctx.setFontSize(36);
    ctx.setFillStyle('#ffffff');
    ctx.fillText(user.name ?? '', W / 2, 222);
    ctx.setFontSize(23);
    ctx.setFillStyle('rgba(255,255,255,0.7)');
    ctx.fillText(ROLE_LABELS[user.role ?? ''] ?? user.role ?? '', W / 2, 262);

    // ── 白色主卡片（圆角用覆盖模拟）─────────────────
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(24, 294, W - 48, H - 318);
    // 圆角效果：在顶部盖两个小矩形遮住直角
    ctx.setFillStyle('#f4f7fa');
    ctx.fillRect(24, 294, 20, 20);
    ctx.fillRect(W - 44, 294, 20, 20);
    ctx.setFillStyle('#ffffff');
    ctx.beginPath();
    ctx.arc(44, 314, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 44, 314, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(24, 294, W - 48, 22);

    // ── 邀请语 ────────────────────────────────────
    ctx.setFontSize(27);
    ctx.setFillStyle('#5c6470');
    ctx.setTextAlign('center');
    ctx.fillText('扫描二维码，登记客户信息', W / 2, 348);

    // ── QR 码 ────────────────────────────────────
    const qrSize = 230;
    const qrX = (W - qrSize) / 2;
    const qrY = 378;
    const ms = qrSize / matrix.length;
    // QR 白色底框
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);
    // QR 外边框
    ctx.setStrokeStyle('#e4eaf0');
    ctx.setLineWidth(2);
    ctx.strokeRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);
    // QR 模块
    matrix.forEach((row, r) => {
      row.forEach((dark, c) => {
        if (!dark) return;
        ctx.setFillStyle('#0a4f5e');
        ctx.fillRect(qrX + c * ms, qrY + r * ms, ms, ms);
      });
    });

    // ── 分享码 ────────────────────────────────────
    ctx.setFontSize(22);
    ctx.setFillStyle('#9ea5b0');
    ctx.fillText('我的分享码', W / 2, 644);
    ctx.setFontSize(52);
    ctx.setFillStyle('#007d7d');
    ctx.fillText(user.shareCode, W / 2, 700);

    // ── 分割线 ────────────────────────────────────
    ctx.setStrokeStyle('#e4eaf0');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(80, 738);
    ctx.lineTo(W - 80, 738);
    ctx.stroke();

    // ── 品牌底部 ──────────────────────────────────
    ctx.setFontSize(22);
    ctx.setFillStyle('#9ea5b0');
    ctx.fillText('客户资源管理系统 · zganquandao.com', W / 2, 770);

    ctx.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'poster-canvas',
        x: 0, y: 0, width: W, height: H,
        destWidth: W * 2, destHeight: H * 2,
        success: (result) => { setPosterSrc(result.tempFilePath); setShowPoster(true); setGenerating(false); },
        fail: () => { setGenerating(false); Taro.showToast({ title: '生成失败', icon: 'none' }); },
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
