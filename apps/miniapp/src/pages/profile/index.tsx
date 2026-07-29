import { useState, useEffect } from 'react';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button, Canvas, Image } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../services/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员', HEAD: '部门负责人', MEMBER: '部门成员',
};

function buildQRMatrix(text: string): boolean[][] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const qr = require('qrcode-generator');
  const q = qr(0, 'M');
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (__, c) => q.isDark(r, c))
  );
}

export default function ProfilePage() {
  const { user, logout, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);
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
      title: '退出登录', content: '确认退出？',
      success: ({ confirm }) => {
        if (confirm) { logout(); Taro.reLaunch({ url: '/pages/login/index' }); }
      },
    });
  };

  const generatePoster = () => {
    if (!user?.shareCode) return;
    setGenerating(true);

    const W = 600, H = 900;
    const matrix = buildQRMatrix(user.shareCode);
    const ctx = Taro.createCanvasContext('poster-canvas');

    // background
    ctx.setFillStyle('#f4f7fa');
    ctx.fillRect(0, 0, W, H);

    // header gradient (top band)
    ctx.setFillStyle('#0a4f5e');
    ctx.fillRect(0, 0, W, 300);
    ctx.setFillStyle('#007d7d');
    ctx.fillRect(0, 200, W, 100);

    // avatar circle
    ctx.beginPath();
    ctx.arc(W / 2, 110, 64, 0, Math.PI * 2);
    ctx.setFillStyle('rgba(255,255,255,0.18)');
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W / 2, 110, 64, 0, Math.PI * 2);
    ctx.setStrokeStyle('rgba(255,255,255,0.45)');
    ctx.setLineWidth(3);
    ctx.stroke();
    ctx.setFillStyle('#ffffff');
    ctx.setFontSize(52);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.fillText(user.name?.[0] ?? '?', W / 2, 110);

    // name
    ctx.setFontSize(34);
    ctx.setFillStyle('#ffffff');
    ctx.fillText(user.name ?? '', W / 2, 200);

    // role
    ctx.setFontSize(22);
    ctx.setFillStyle('rgba(255,255,255,0.7)');
    ctx.fillText(ROLE_LABELS[user.role ?? ''] ?? user.role ?? '', W / 2, 240);

    // white card
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(32, 270, W - 64, H - 300);

    // invitation text
    ctx.setFontSize(26);
    ctx.setFillStyle('#5c6470');
    ctx.fillText('扫描二维码或输入分享码  即可登记信息', W / 2, 320);

    // QR code
    const qrSize = 220;
    const qrX = (W - qrSize) / 2;
    const qrY = 348;
    const n = matrix.length;
    const ms = qrSize / n;
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          ctx.setFillStyle('#0a4f5e');
          ctx.fillRect(qrX + c * ms, qrY + r * ms, ms, ms);
        }
      }
    }

    // share code label
    ctx.setFontSize(22);
    ctx.setFillStyle('#9ea5b0');
    ctx.fillText('分享码', W / 2, 608);

    // share code value
    ctx.setFontSize(52);
    ctx.setFillStyle('#007d7d');
    ctx.fillText(user.shareCode, W / 2, 668);

    // divider
    ctx.setStrokeStyle('#e4eaf0');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(80, 705);
    ctx.lineTo(W - 80, 705);
    ctx.stroke();

    // footer
    ctx.setFontSize(22);
    ctx.setFillStyle('#9ea5b0');
    ctx.fillText('客户资源管理系统', W / 2, 740);

    ctx.draw(false, () => {
      Taro.canvasToTempFilePath({
        canvasId: 'poster-canvas',
        x: 0, y: 0, width: W, height: H,
        destWidth: W * 2, destHeight: H * 2,
        success: (res) => { setPosterSrc(res.tempFilePath); setShowPoster(true); setGenerating(false); },
        fail: () => { setGenerating(false); Taro.showToast({ title: '生成失败', icon: 'none' }); },
      });
    });
  };

  const savePoster = () => {
    if (!posterSrc) return;
    Taro.saveImageToPhotosAlbum({
      filePath: posterSrc,
      success: () => Taro.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (err) => {
        if (String(err?.errMsg).includes('auth')) {
          Taro.showModal({
            title: '需要相册权限', content: '请在设置中允许访问相册',
            confirmText: '去设置',
            success: ({ confirm }) => { if (confirm) Taro.openSetting(); },
          });
        }
      },
    });
  };

  const navItems = [
    { title: '分成明细', desc: '查看我的分成记录', url: '/pages/commissions/list', visible: true },
    { title: '审批待办', desc: '处理入会和退款审批', url: '/pages/approvals/index', visible: user?.role === 'HEAD' || user?.role === 'ADMIN' },
  ].filter((item) => item.visible);

  if (!authorized) return <View className='page' />;

  return (
    <View className='page' style={{ paddingBottom: '64rpx' }}>
      {/* 离屏 Canvas — 用于绘制海报 */}
      <Canvas
        canvasId='poster-canvas'
        style={{ position: 'fixed', left: '-1200rpx', top: 0, width: '600px', height: '900px' }}
      />

      {/* Hero Banner */}
      <View style={{ background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', borderRadius: '0 0 40rpx 40rpx', padding: '48rpx 32rpx 56rpx', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20rpx' }}>
        <View style={{ width: '120rpx', height: '120rpx', borderRadius: '999rpx', background: 'rgba(255,255,255,0.2)', border: '4rpx solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'var(--color-text-inv)', fontSize: '48rpx', fontWeight: '800' }}>{user?.name?.[0] ?? '?'}</Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '40rpx', fontWeight: '800', color: 'var(--color-text-inv)', display: 'block' }}>{user?.name}</Text>
          <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '8rpx' }}>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
          </Text>
        </View>
      </View>

      {/* 分享邀请 */}
      {user?.shareCode && (
        <View style={{ margin: 'var(--space-md) var(--space-md) 0', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-card)' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <Text style={{ fontSize: '26rpx', color: 'var(--color-text-2)', flex: 1 }}>我的分享码</Text>
            <Text style={{ fontFamily: '"Courier New", "SF Mono", monospace', fontSize: '40rpx', fontWeight: '700', color: 'var(--color-brand)', letterSpacing: '0.15em', marginRight: '16rpx' }}>
              {user.shareCode}
            </Text>
            <Text style={{ fontSize: '24rpx', color: 'var(--color-brand)', border: '2rpx solid var(--color-brand)', padding: '8rpx 20rpx', borderRadius: 'var(--radius-pill)' }} onClick={handleCopyCode}>复制</Text>
          </View>
          <View style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <Button
              style={{ flex: 1, background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', fontSize: '28rpx', fontWeight: '600', height: '88rpx', lineHeight: '88rpx', padding: 0 }}
              openType='share'
            >
              分享给客户
            </Button>
            <View
              style={{ flex: 1, height: '88rpx', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2rpx solid var(--color-brand)', borderRadius: 'var(--radius-md)', fontSize: '28rpx', fontWeight: '600', color: 'var(--color-brand)' }}
              onClick={generating ? undefined : generatePoster}
            >
              {generating ? '生成中…' : '生成邀请海报'}
            </View>
          </View>
        </View>
      )}

      {/* 常用功能 */}
      <View style={{ margin: 'var(--space-md) var(--space-md) 0', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {navItems.map((item, index) => (
          <View
            key={item.url}
            style={{ padding: '28rpx 32rpx', borderBottom: index < navItems.length - 1 ? '1rpx solid var(--color-divider)' : 'none', display: 'flex', alignItems: 'center' }}
            onClick={() => Taro.navigateTo({ url: item.url })}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ display: 'block', fontSize: '30rpx', fontWeight: '700', color: 'var(--color-text-1)' }}>{item.title}</Text>
              <Text style={{ display: 'block', marginTop: '6rpx', fontSize: '24rpx', color: 'var(--color-text-3)' }}>{item.desc}</Text>
            </View>
            <Text style={{ color: 'var(--color-text-3)', fontSize: '36rpx' }}>›</Text>
          </View>
        ))}
      </View>

      {/* 退出登录 */}
      <View style={{ padding: 'var(--space-xl) var(--space-md) 0', textAlign: 'center' }}>
        <Text style={{ fontSize: '28rpx', color: 'var(--color-text-3)' }} onClick={handleLogout}>退出登录</Text>
      </View>

      {/* 海报预览遮罩 */}
      {showPoster && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <Image
            src={posterSrc}
            style={{ width: '560rpx', height: '840rpx', borderRadius: '16rpx' }}
            mode='widthFix'
          />
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24rpx', marginTop: '24rpx' }}>长按图片也可保存</Text>
          <View style={{ display: 'flex', gap: '24rpx', marginTop: '32rpx' }}>
            <View
              style={{ padding: '20rpx 64rpx', background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', borderRadius: '999rpx', fontSize: '30rpx', fontWeight: '600', color: '#fff' }}
              onClick={savePoster}
            >
              保存到相册
            </View>
            <View
              style={{ padding: '20rpx 48rpx', border: '2rpx solid rgba(255,255,255,0.4)', borderRadius: '999rpx', fontSize: '30rpx', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => setShowPoster(false)}
            >
              关闭
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
