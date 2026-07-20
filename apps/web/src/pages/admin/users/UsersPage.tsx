import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Form, Input, Select, Tag, Space, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../services/users';
import { departmentsApi } from '../../../services/departments';
import { positionsApi } from '../../../services/positions';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  HEAD: '部门负责人',
  MEMBER: '部门成员',
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'red',
  HEAD: 'blue',
  MEMBER: 'default',
};

interface UserRow {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  department?: { name: string };
  position?: { name: string };
}

interface DeptItem {
  id: string;
  name: string;
}

interface PositionItem {
  id: string;
  name: string;
}

export default function UsersPage() {
  const { message, modal } = App.useApp();
  const qc = useQueryClient();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [form] = Form.useForm();

  const { data: depts = [] } = useQuery<DeptItem[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll() as unknown as Promise<DeptItem[]>,
  });
  const { data: positions = [] } = useQuery<PositionItem[]>({
    queryKey: ['positions'],
    queryFn: () => positionsApi.getAll() as unknown as Promise<PositionItem[]>,
  });

  const saveMutation = useMutation({
    mutationFn: (data: unknown) =>
      editTarget ? usersApi.update(editTarget.id, data) : usersApi.create(data),
    onSuccess: () => {
      message.success('保存成功');
      qc.invalidateQueries({ queryKey: ['users'] });
      setDrawerOpen(false);
      form.resetFields();
      setEditTarget(null);
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
      message.success('操作成功');
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const columns: ProColumns<UserRow>[] = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '角色',
      dataIndex: 'role',
      width: 120,
      render: (_, r) => (
        <Tag color={ROLE_COLORS[r.role]}>{ROLE_LABELS[r.role]}</Tag>
      ),
    },
    { title: '所属部门', dataIndex: ['department', 'name'], width: 130 },
    { title: '岗位', dataIndex: ['position', 'name'], width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, r) => (
        <Tag color={r.status === 'ACTIVE' ? 'green' : 'default'}>
          {r.status === 'ACTIVE' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      search: false,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditTarget(r);
              form.setFieldsValue(r);
              setDrawerOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger={r.status === 'ACTIVE'}
            onClick={() =>
              modal.confirm({
                title: r.status === 'ACTIVE' ? '确认禁用该员工？' : '确认启用该员工？',
                onOk: () =>
                  statusMutation.mutate({
                    id: r.id,
                    status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                  }),
              })
            }
          >
            {r.status === 'ACTIVE' ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<UserRow>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = (await usersApi.getAll({
            departmentId: params.departmentId,
            role: params.role,
            page: params.current,
            pageSize: params.pageSize,
          })) as { data?: UserRow[]; total?: number } | UserRow[];
          if (Array.isArray(res)) {
            return { data: res, success: true, total: res.length };
          }
          return { data: res.data ?? [], success: true, total: res.total ?? 0 };
        }}
        toolbar={{
          actions: [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTarget(null);
                form.resetFields();
                setDrawerOpen(true);
              }}
            >
              新建员工
            </Button>,
          ],
        }}
        scroll={{ x: 900 }}
      />

      <Drawer
        title={editTarget ? '编辑员工' : '新建员工'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditTarget(null);
        }}
        width={480}
        footer={
          <Button
            type="primary"
            loading={saveMutation.isPending}
            onClick={() => form.submit()}
          >
            保存
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editTarget && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {editTarget && (
            <Form.Item name="newPassword" label="修改密码（不填则不修改）">
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={Object.entries(ROLE_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </Form.Item>
          <Form.Item name="departmentId" label="部门">
            <Select
              allowClear
              options={depts.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="positionId" label="岗位">
            <Select
              allowClear
              options={positions.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
