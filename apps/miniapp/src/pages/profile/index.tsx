import { useState, useEffect } from 'react';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button, Canvas } from '@tarojs/components';
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

    // type='2d' canvas — 用 SelectorQuery 获取 canvas node
    const query = Taro.createSelectorQuery();
    query.select('#poster-canvas').node().exec((res: any[]) => {
      const canvas = res[0]?.node;
      if (!canvas) {
        setGenerating(false);
        Taro.showToast({ title: '画布初始化失败', icon: 'none' });
        return;
      }

      // 设置物理像素尺寸（2x 输出，坐标系同步放大）
      const S = 2; // 缩放倍数，画布物理像素 = CSS 像素 × S
      canvas.width = W * S;
      canvas.height = H * S;
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      ctx.scale(S, S);

      // ── 背景 ──────────────────────────────────────
      ctx.fillStyle = '#f0f4f8';
      ctx.fillRect(0, 0, W, H);

      // ── 头部色块（深色 + 中色，更紧凑）─────────────
      const HEADER_H = 240;
      ctx.fillStyle = '#0a4f5e';
      ctx.fillRect(0, 0, W, HEADER_H);
      // 底部轻微过渡
      const grad = ctx.createLinearGradient(0, HEADER_H - 60, 0, HEADER_H);
      grad.addColorStop(0, '#0a4f5e');
      grad.addColorStop(1, '#006b6b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, HEADER_H - 60, W, 60);

      // ── 头像圆 ───────────────────────────────────
      const AV_CY = 110;
      const AV_R = 62;
      ctx.beginPath();
      ctx.arc(W / 2, AV_CY, AV_R + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2, AV_CY, AV_R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2, AV_CY, AV_R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(user.name?.[0] ?? '?', W / 2, AV_CY);

      // ── 姓名 & 角色（紧凑间距）───────────────────
      ctx.font = 'bold 34px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(user.name ?? '', W / 2, 195);
      ctx.font = '22px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillText(ROLE_LABELS[user.role ?? ''] ?? user.role ?? '', W / 2, 226);

      // ── 白色主卡片（圆角 20px 模拟）────────────────
      const CARD_Y = HEADER_H + 16;
      const CARD_X = 20;
      const CARD_W = W - 40;
      const CARD_H = H - CARD_Y - 20;
      const R = 20;
      // 填充主体
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(CARD_X + R, CARD_Y, CARD_W - R * 2, CARD_H);
      ctx.fillRect(CARD_X, CARD_Y + R, CARD_W, CARD_H - R * 2);
      // 四角圆弧
      [[CARD_X + R, CARD_Y + R], [CARD_X + CARD_W - R, CARD_Y + R],
       [CARD_X + R, CARD_Y + CARD_H - R], [CARD_X + CARD_W - R, CARD_Y + CARD_H - R]]
        .forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fill();
        });

      // ── 邀请语 ────────────────────────────────────
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#7a8694';
      ctx.textAlign = 'center';
      ctx.fillText('扫描下方二维码，登记客户信息', W / 2, CARD_Y + 44);

      // ── QR 码（居中，留足边距）───────────────────
      const qrSize = 260;
      const qrX = (W - qrSize) / 2;
      const qrY = CARD_Y + 72;
      const ms = qrSize / matrix.length;
      // QR 背景框
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
      ctx.strokeStyle = '#dde4ec';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
      // QR 模块
      ctx.fillStyle = '#0a4f5e';
      matrix.forEach((row, r) => {
        row.forEach((dark, c) => {
          if (!dark) return;
          ctx.fillRect(qrX + c * ms, qrY + r * ms, ms - 0.5, ms - 0.5);
        });
      });

      // ── 分享码区块 ────────────────────────────────
      const codeY = qrY + qrSize + 52;
      ctx.font = '21px sans-serif';
      ctx.fillStyle = '#9ea5b0';
      ctx.fillText('我的分享码', W / 2, codeY);
      ctx.font = 'bold 54px "Courier New", monospace';
      ctx.fillStyle = '#007d7d';
      ctx.fillText(user.shareCode, W / 2, codeY + 56);

      // type='2d' 是同步的，直接显示
      setShowPoster(true);
      setGenerating(false);
    });
  };

  const savePoster = () => {
    const query = Taro.createSelectorQuery();
    query.select('#poster-canvas').node().exec((res: any[]) => {
      const canvas = res[0]?.node;
      if (!canvas) return;
      Taro.canvasToTempFilePath({
        canvas,
        success: (result) => {
          Taro.saveImageToPhotosAlbum({
            filePath: result.tempFilePath,
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
        },
        fail: () => Taro.showToast({ title: '导出失败', icon: 'none' }),
      });
    });
  };

  const navItems = [
    { title: '分成明细', desc: '查看收入、状态和结算日期', url: '/pages/commissions/list', visible: true },
    { title: '审批待办', desc: '处理入会与退款申请', url: '/pages/approvals/index', visible: user?.role === 'HEAD' || user?.role === 'ADMIN' },
  ].filter((item) => item.visible);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  return (
    <View className='page profile-page'>
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

      {/* 海报弹层：Canvas type='2d' 是普通组件，不是原生组件，CSS 尺寸完全可控 */}
      <View className={`poster-mask${showPoster ? ' poster-mask--show' : ''}`}>
        <Canvas
          type='2d'
          id='poster-canvas'
          style={{ width: '540rpx', height: '810rpx', borderRadius: '16rpx', flexShrink: 0 }}
        />
        <Text className='poster-mask__hint'>长按图片也可保存</Text>
        <View className='poster-actions'>
          <Button className='btn btn--primary' onClick={savePoster}>保存到相册</Button>
          <Button className='btn poster-close' onClick={() => setShowPoster(false)}>关闭</Button>
        </View>
      </View>
    </View>
  );
}
