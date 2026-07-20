import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Form, Input, Select, Space, Tag, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { customersApi } from '../../../services/customers';

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL: '转介绍',
  SELF_DEVELOPED: '自主开发',
  ACTIVITY: '活动',
  ONLINE: '线上',
  OTHER: '其他',
};

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  customerType: string;
  source: string;
  tags?: string;
  birthday?: string;
  assignedUser?: { name: string };
}

export default function CustomersPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerRow | null>(null);
  const [form] = Form.useForm();

  const saveMutation = useMutation({
    mutationFn: (data: unknown) =>
      editTarget ? customersApi.update(editTarget.id, data) : customersApi.create(data),
    onSuccess: () => {
      message.success('保存成功');
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

  const columns: ProColumns<CustomerRow>[] = [
    { title: '客户名称', dataIndex: 'name', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    {
      title: '类型',
      dataIndex: 'customerType',
      width: 80,
      render: (_, r) => (
        <Tag>{r.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Tag>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (_, r) => SOURCE_LABELS[r.source] ?? r.source,
    },
    { title: '维护人', dataIndex: ['assignedUser', 'name'], width: 100 },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      search: false,
      render: (_, r) =>
        r.tags
          ? r.tags.split(',').map((t) => <Tag key={t}>{t}</Tag>)
          : null,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditTarget(r);
              form.setFieldsValue({
                ...r,
                birthday: r.birthday?.slice(0, 10),
              });
              setDrawerOpen(true);
            }}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<CustomerRow>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = (await customersApi.getAll({
            name: params.name,
            phone: params.phone,
            page: params.current,
            pageSize: params.pageSize,
          })) as { data?: CustomerRow[]; total?: number } | CustomerRow[];
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
              新增客户
            </Button>,
          ],
        }}
        scroll={{ x: 800 }}
      />

      <Drawer
        title={editTarget ? '编辑客户' : '新增客户'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditTarget(null);
        }}
        width={520}
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
          <Form.Item
            name="customerType"
            label="客户类型"
            rules={[{ required: true }]}
            initialValue="INDIVIDUAL"
          >
            <Select
              options={[
                { value: 'INDIVIDUAL', label: '个人' },
                { value: 'COMPANY', label: '企业' },
              ]}
            />
          </Form.Item>
          <Form.Item name="name" label="姓名/公司名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机/联系电话" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="source" label="来源渠道">
            <Select
              allowClear
              options={Object.entries(SOURCE_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </Form.Item>
          <Form.Item name="wechat" label="微信号">
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="高净值,转介绍" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
