import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { App, Button, Drawer, Form, Input, Space, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../../../services/users';

interface AdminRow {
  id: string;
  name: string;
  username?: string;
  phone: string;
  status: string;
}

export default function AdminsPage() {
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminRow | null>(null);
  const [form] = Form.useForm();

  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const all = upper + lower + digits;
    let pwd =
      upper[Math.floor(Math.random() * upper.length)] +
      lower[Math.floor(Math.random() * lower.length)] +
      digits[Math.floor(Math.random() * digits.length)];
    for (let i = 3; i < 12; i++) pwd += all[Math.floor(Math.random() * all.length)];
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
  };

  const saveMutation = useMutation({
    mutationFn: (data: unknown) =>
      editTarget ? usersApi.update(editTarget.id, data) : usersApi.create(data),
    onSuccess: () => {
      message.success('保存成功');
      closeDrawer();
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.setStatus(id, { status }),
    onSuccess: () => {
      message.success('状态更新成功');
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const openEdit = (record: AdminRow) => {
    setEditTarget(record);
    form.setFieldsValue({
      name: record.name,
      username: record.username,
      phone: record.phone,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
    form.resetFields();
  };

  const changeStatus = (record: AdminRow) => {
    if (record.status === 'INACTIVE') {
      modal.confirm({
        title: '确认启用该管理员？',
        onOk: () => statusMutation.mutate({ id: record.id, status: 'ACTIVE' }),
      });
      return;
    }
    modal.confirm({
      title: `禁用「${record.name}」`,
      content: '禁用后该账号将无法登录系统，确认操作？',
      okText: '确认禁用',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => statusMutation.mutate({ id: record.id, status: 'INACTIVE' }),
    });
  };

  const columns: ProColumns<AdminRow>[] = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueEnum: {
        ACTIVE: { text: '启用', status: 'Success' },
        INACTIVE: { text: '禁用', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'default'}>
          {record.status === 'ACTIVE' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? '禁用' : '启用'}>
            <Button
              size="small"
              danger={record.status === 'ACTIVE'}
              icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => changeStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<AdminRow>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const response = await usersApi.getAll({
            role: 'ADMIN',
            username: params.username,
            name: params.name,
            phone: params.phone,
            status: params.status,
          }) as unknown as AdminRow[];
          return { data: response, success: true, total: response.length };
        }}
        toolbar={{
          actions: [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTarget(null);
                const pwd = generatePassword();
                form.resetFields();
                form.setFieldValue('password', pwd);
                setDrawerOpen(true);
              }}
            >
              新建管理员
            </Button>,
          ],
        }}
      />

      <Drawer
        title={editTarget ? `编辑管理员 · ${editTarget.name}` : '新建管理员'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={440}
        footer={
          <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
            保存
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = editTarget
              ? {
                  name: values.name,
                  username: values.username,
                  phone: values.phone,
                  newPassword: values.newPassword || undefined,
                }
              : {
                  name: values.name,
                  username: values.username,
                  phone: values.phone,
                  password: values.password,
                  role: 'ADMIN',
                };
            saveMutation.mutate(payload);
          }}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="登录用户名"
            rules={[
              { required: true, message: '请输入登录用户名' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_.-]{2,31}$/,
                message: '以字母开头，支持3-32位字母、数字、点、下划线或短横线',
              },
            ]}
          >
            <Input autoComplete="off" placeholder="例如：admin" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editTarget && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[
                { required: true },
                { min: 8, message: '密码至少8位' },
                { pattern: /(?=.*[a-zA-Z])(?=.*\d)/, message: '须包含字母和数字' },
              ]}
            >
              <Input.Password
                suffix={
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const pwd = form.getFieldValue('password');
                      if (pwd) { navigator.clipboard.writeText(pwd); message.success('已复制'); }
                    }}
                  >
                    复制
                  </Button>
                }
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
          )}
          {editTarget && (
            <Form.Item
              name="newPassword"
              label="修改密码（不填则不修改）"
              rules={[{ min: 8, message: '密码至少8位' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </>
  );
}
