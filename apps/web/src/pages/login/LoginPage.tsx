import { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import request from '../../services/request';
import { useAuthStore } from '../../store/auth';
import type { LoginDto, LoginResponseDto } from 'shared';

/* Hallmark · genre: modern-minimal · macrostructure: Workbench (centered card)
 * design-system: design.md · designed-as-app · page: login
 *
 * Structure rationale:
 * — System name lives outside the card as a standalone heading.
 *   Previously it was inside Card's title prop, which put it at the same
 *   visual level as the input container — no hierarchy.
 * — Error uses an inline Alert instead of message.error() which disappears
 *   after 3s. Login errors should persist until the user corrects them.
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginDto) =>
      request.post<LoginResponseDto, LoginResponseDto>('/auth/login', data),
    onSuccess: (res) => {
      setLoginError(null);
      setAuth(res.token, res.user);
      navigate('/', { replace: true });
    },
    onError: () => setLoginError('账号或密码错误，请重新输入'),
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'var(--space-md)',
      background: 'var(--color-paper)',
    }}>
      {/* System name as standalone heading — sits above the form surface,
          not embedded in it. Gives the page a visual anchor. */}
      <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          letterSpacing: 'var(--tracking-display)',
          color: 'var(--color-ink)',
          lineHeight: 1.3,
        }}>
          客户资源管理系统
        </h1>
        <p style={{
          margin: '6px 0 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-ink-2)',
          letterSpacing: '0.01em',
        }}>
          请使用工作账号登录
        </p>
      </div>

      {/* Card is now purely a form surface with no title */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--color-paper)',
        border: '1px solid var(--color-rule)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: '0 1px 2px oklch(0% 0 0 / 0.04), 0 4px 16px oklch(0% 0 0 / 0.06)',
      }}>
        {/* Persistent error — stays visible until user resubmits successfully */}
        {loginError && (
          <Alert
            type="error"
            message={loginError}
            showIcon
            style={{ marginBottom: 'var(--space-md)' }}
            closable
            onClose={() => setLoginError(null)}
          />
        )}

        <Form
          onFinish={(values) => {
            setLoginError(null);
            login(values as LoginDto);
          }}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="account"
            label="账号"
            rules={[{ required: true, message: '请输入用户名或手机号' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--color-ink-2)' }} />}
              placeholder="用户名或手机号"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 'var(--space-lg)' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--color-ink-2)' }} />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={isPending} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
