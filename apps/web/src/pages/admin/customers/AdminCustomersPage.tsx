import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Form, Input, Select, Tag, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { customersApi } from '../../../services/customers';
import { departmentsApi } from '../../../services/departments';

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL: '转介绍', SELF_DEVELOPED: '自主开发', ACTIVITY: '活动', ONLINE: '线上', OTHER: '其他',
};

export default function AdminCustomersPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: depts = [] } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editTarget ? customersApi.update(editTarget.id, data) : customersApi.create(data),
    onSuccess: () => { message.success('保存成功'); setDrawerOpen(false); form.resetFields(); actionRef.current?.reload(); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '操作失败'),
  });

  const columns: ProColumns[] = [
    { title: '客户名称', dataIndex: 'name', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    { title: '类型', dataIndex: 'customerType', width: 80, render: (_, r) => <Tag>{r.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Tag> },
    { title: '来源', dataIndex: 'source', width: 100, render: (_, r) => SOURCE_LABELS[r.source] ?? r.source },
    { title: '所属部门', dataIndex: ['department', 'name'], width: 120 },
    { title: '维护人', dataIndex: ['assignedUser', 'name'], width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: (_, r) => <Tag color={r.status === 'ACTIVE' ? 'green' : 'default'}>{r.status === 'ACTIVE' ? '正常' : '停用'}</Tag> },
    {
      title: '操作', width: 80, fixed: 'right',
      render: (_, r) => (
        <Button size="small" onClick={() => { setEditTarget(r); form.setFieldsValue(r); setDrawerOpen(true); }}>编辑</Button>
      ),
    },
  ];

  return (
    <>
      <ProTable
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res: any = await customersApi.getAll({ departmentId: params.departmentId, name: params.name, page: params.current, pageSize: params.pageSize });
          return { data: res.data ?? [], total: res.total ?? 0, success: true };
        }}
        toolbar={{ actions: [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditTarget(null); form.resetFields(); setDrawerOpen(true); }}>新增客户</Button>] }}
        scroll={{ x: 900 }}
      />
      <Drawer title={editTarget ? '编辑客户' : '新增客户'} open={drawerOpen} onClose={() => { setDrawerOpen(false); form.resetFields(); }} width={480} footer={<Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>保存</Button>}>
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]} initialValue="INDIVIDUAL">
            <Select options={[{ value: 'INDIVIDUAL', label: '个人' }, { value: 'COMPANY', label: '企业' }]} />
          </Form.Item>
          <Form.Item name="name" label="姓名/公司名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="手机/联系电话" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label="来源渠道">
            <Select allowClear options={Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="departmentId" label="所属部门">
            <Select allowClear options={(depts as any[]).map((d: any) => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
