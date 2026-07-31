import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  App, Button, DatePicker, Drawer, Form, Input, InputNumber,
  Popconfirm, Select, Space, Switch, Tag,
} from 'antd';
import {
  CheckCircleOutlined, EditOutlined, PlusOutlined, StopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ProTable from '../../../components/BusinessProTable';
import { customersApi } from '../../../services/customers';
import { usersApi } from '../../../services/users';

const SOURCE_OPTS = [
  { label: '转介绍', value: 'REFERRAL' },
  { label: '自主开发', value: 'SELF_DEVELOPED' },
  { label: '活动', value: 'ACTIVITY' },
  { label: '线上', value: 'ONLINE' },
  { label: '其他', value: 'OTHER' },
];
const RISK_OPTS = [
  { label: '保守型', value: 'CONSERVATIVE' },
  { label: '稳健型', value: 'MODERATE' },
  { label: '积极型', value: 'AGGRESSIVE' },
  { label: '激进型', value: 'SPECULATIVE' },
];

interface CustomerRow {
  id: string; name: string; phone: string;
  customerType: string; source: string; status: string;
  wechat?: string; gender?: string; birthday?: string; address?: string; idCard?: string;
  creditCode?: string; industry?: string; contactName?: string; contactPhone?: string;
  legalPerson?: string; registeredCapital?: string;
  riskTolerance?: string; isAccreditedInvestor?: boolean; investmentAmount?: string;
  tags?: string; notes?: string;
  department?: { id: string; name: string };
  assignedUser?: { id: string; name: string };
}

export default function AdminCustomersPage() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [custType, setCustType] = useState<string>('INDIVIDUAL');

  const { data: userOpts } = useQuery({
    queryKey: ['users-simple'],
    queryFn: () => usersApi.getAll({ pageSize: 200 }) as any,
    select: (res: any) => (res?.data ?? []).map((u: any) => ({ label: `${u.name}（${u.phone}）`, value: u.id })),
  });

  const createMut = useMutation({
    mutationFn: (data: unknown) => customersApi.create(data),
    onSuccess: () => { message.success('创建成功'); closeDrawer(); actionRef.current?.reload(); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '操作失败'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => customersApi.update(id, data),
    onSuccess: () => { message.success('保存成功'); closeDrawer(); actionRef.current?.reload(); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '操作失败'),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => customersApi.update(id, { status }),
    onSuccess: () => { message.success('状态已更新'); actionRef.current?.reload(); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '操作失败'),
  });

  const closeDrawer = () => { setDrawerOpen(false); form.resetFields(); };
  const openCreate = () => {
    setEditingId(null); setCustType('INDIVIDUAL');
    form.resetFields(); form.setFieldValue('customerType', 'INDIVIDUAL');
    setDrawerOpen(true);
  };
  const openEdit = (row: CustomerRow) => {
    setEditingId(row.id); setCustType(row.customerType);
    form.setFieldsValue({
      ...row,
      birthday: row.birthday ? dayjs(row.birthday) : undefined,
      assignedUserId: row.assignedUser?.id,
      investmentAmount: row.investmentAmount ? Number(row.investmentAmount) : undefined,
    });
    setDrawerOpen(true);
  };
  const handleSubmit = async () => {
    const vals = await form.validateFields();
    const payload = {
      ...vals,
      birthday: vals.birthday ? vals.birthday.format('YYYY-MM-DD') : undefined,
      investmentAmount: vals.investmentAmount != null ? String(vals.investmentAmount) : undefined,
    };
    if (editingId) updateMut.mutate({ id: editingId, data: payload });
    else createMut.mutate(payload);
  };

  const isLoading = createMut.isPending || updateMut.isPending;
  const isCompany = custType === 'COMPANY';

  const columns: ProColumns<CustomerRow>[] = [
    { title: '客户名称', dataIndex: 'name', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    {
      title: '类型', dataIndex: 'customerType', width: 80,
      render: (_, r) => <Tag color={r.customerType === 'COMPANY' ? 'blue' : 'default'}>{r.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Tag>,
    },
    { title: '来源', dataIndex: 'source', width: 100, search: false, render: (_, r) => SOURCE_OPTS.find(s => s.value === r.source)?.label ?? r.source },
    { title: '部门', dataIndex: ['department', 'name'], width: 120, search: false },
    { title: '维护人', dataIndex: ['assignedUser', 'name'], width: 100, search: false },
    {
      title: '状态', dataIndex: 'status', width: 80,
      valueType: 'select',
      valueEnum: { ACTIVE: { text: '正常', status: 'Success' }, INACTIVE: { text: '停用', status: 'Default' } },
    },
    {
      title: '操作', width: 110, search: false, fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>编辑</Button>
          <Popconfirm
            title={row.status === 'ACTIVE' ? '确认停用？' : '确认启用？'}
            onConfirm={() => toggleMut.mutate({ id: row.id, status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
          >
            <Button size="small" danger={row.status === 'ACTIVE'}
              icon={row.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />} />
          </Popconfirm>
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
        headerTitle="客户管理"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增客户</Button>,
        ]}
        request={async (params) => {
          const res = await customersApi.getAll({
            name: params.name, phone: params.phone, status: params.status,
            page: params.current, pageSize: params.pageSize,
          }) as any;
          return { data: res?.data ?? [], total: res?.total ?? 0, success: true };
        }}
        scroll={{ x: 900 }}
      />

      <Drawer
        title={editingId ? '编辑客户' : '新增客户'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={520}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" loading={isLoading} onClick={handleSubmit}>保存</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" size="middle">
          <Form.Item label="客户类型" name="customerType" initialValue="INDIVIDUAL">
            <Select options={[{ label: '个人客户', value: 'INDIVIDUAL' }, { label: '企业客户', value: 'COMPANY' }]}
              onChange={setCustType} />
          </Form.Item>
          <Form.Item label={isCompany ? '企业名称' : '姓名'} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={isCompany ? '联系电话' : '手机号'} name="phone" rules={[{ required: true }]}>
            <Input maxLength={11} />
          </Form.Item>
          <Form.Item label="客户来源" name="source" initialValue="REFERRAL">
            <Select options={SOURCE_OPTS} />
          </Form.Item>
          <Form.Item label="微信号" name="wechat"><Input /></Form.Item>

          {!isCompany && (<>
            <Form.Item label="性别" name="gender">
              <Select allowClear options={[{ label: '男', value: 'MALE' }, { label: '女', value: 'FEMALE' }, { label: '未知', value: 'UNKNOWN' }]} />
            </Form.Item>
            <Form.Item label="生日" name="birthday"><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="地址" name="address"><Input /></Form.Item>
            <Form.Item label="身份证号" name="idCard"><Input maxLength={18} /></Form.Item>
          </>)}

          {isCompany && (<>
            <Form.Item label="法人代表" name="legalPerson"><Input /></Form.Item>
            <Form.Item label="注册资本" name="registeredCapital"><Input placeholder="如：500万元" /></Form.Item>
            <Form.Item label="统一信用代码" name="creditCode"><Input maxLength={18} /></Form.Item>
            <Form.Item label="行业" name="industry"><Input /></Form.Item>
            <Form.Item label="联系人姓名" name="contactName"><Input /></Form.Item>
            <Form.Item label="联系人手机" name="contactPhone"><Input maxLength={11} /></Form.Item>
          </>)}

          <Form.Item label="风险承受能力" name="riskTolerance">
            <Select allowClear options={RISK_OPTS} />
          </Form.Item>
          <Form.Item label="合格投资人" name="isAccreditedInvestor" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="意向投资额（万元）" name="investmentAmount">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item label="标签" name="tags"><Input placeholder="多个标签用逗号分隔" /></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={3} /></Form.Item>

          {!editingId && (
            <Form.Item label="归属人（指定维护人）" name="assignedUserId" rules={[{ required: true, message: '请指定归属人' }]}>
              <Select options={userOpts ?? []} showSearch optionFilterProp="label" placeholder="搜索姓名或手机号" />
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </>
  );
}

