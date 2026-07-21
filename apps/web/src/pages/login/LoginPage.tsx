import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import request from '../../services/request';
import { useAuthStore } from '../../store/auth';
import type { LoginDto, LoginResponseDto } from 'shared';

/* Hallmark · genre: modern-minimal · macrostructure: Workbench (centered card)
 * design-system: design.md · designed-as-app · page: login
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginDto) =>
      request.post<LoginResponseDto, LoginResponseDto>('/auth/login', data),
    onSuccess: (res) => {
      setAuth(res.token, res.user);
      navigate('/', { replace: true });
    },
    onError: () => message.error('账号或密码错误'),
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-md)',
        background: 'var(--color-paper)',
      }}
    >
      <Card
        title="客户资源管理系统"
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        }}
        styles={{
          header: {
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            borderBottom: '1px solid var(--color-rule)',
          },
        }}
      >
        <Form onFinish={login} autoComplete="off" layout="vertical">
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
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--color-ink-2)' }} />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 'var(--space-md)' }}>
            <Button type="primary" htmlType="submit" loading={isPending} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
