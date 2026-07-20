import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Form, Select, InputNumber, DatePicker, Tag, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { membershipsApi } from '../../../services/memberships';
import { customersApi } from '../../../services/customers';
import { memberLevelsApi } from '../../../services/memberLevels';
import dayjs from 'dayjs';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '有效',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
  REFUND_PENDING: '退款中',
  REFUNDED: '已退款',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
  EXPIRED: 'default',
  REFUND_PENDING: 'orange',
  REFUNDED: 'default',
};

interface MembershipRecord {
  id: string;
  memberNo: string;
  status: string;
  fee: string | number;
  startDate: string;
  endDate: string;
  reviewNote?: string;
  customer?: { name: string };
  memberLevel?: { name: string };
}

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
}

interface MemberLevelRecord {
  id: string;
  name: string;
}

export default function MembershipsPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: customers } = useQuery({
    queryKey: ['my-customers'],
    queryFn: () => customersApi.getAll({ pageSize: 100 }),
  });
  const { data: levels } = useQuery({
    queryKey: ['member-levels'],
    queryFn: () => memberLevelsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { customerId: string; memberLevelId?: string; fee: number; dateRange: [dayjs.Dayjs, dayjs.Dayjs] }) =>
      membershipsApi.create({
        customerId: data.customerId,
        memberLevelId: data.memberLevelId,
        fee: data.fee,
        startDate: data.dateRange[0].format('YYYY-MM-DD'),
        endDate: data.dateRange[1].format('YYYY-MM-DD'),
      }),
    onSuccess: () => {
      message.success('提交成功，等待负责人审批');
      setDrawerOpen(false);
      form.resetFields();
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '提交失败');
    },
  });

  const customersData: CustomerRecord[] = (customers as { data?: CustomerRecord[] } | undefined)?.data ?? [];
  const levelsData: MemberLevelRecord[] = Array.isArray(levels) ? (levels as MemberLevelRecord[]) : [];

  const columns: ProColumns<MembershipRecord>[] = [
    { title: '会员编号', dataIndex: 'memberNo', width: 140 },
    { title: '客户', dataIndex: ['customer', 'name'], width: 100 },
    { title: '会员等级', dataIndex: ['memberLevel', 'name'], width: 100 },
    {
      title: '会员费',
      dataIndex: 'fee',
      width: 100,
      render: (_, r) => `¥${Number(r.fee).toLocaleString()}`,
    },
    {
      title: '有效期',
      width: 200,
      render: (_, r) => `${r.startDate?.slice(0, 10)} ~ ${r.endDate?.slice(0, 10)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => (
        <Tag color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Tag>
      ),
    },
    { title: '审批备注', dataIndex: 'reviewNote', width: 150 },
  ];

  return (
    <>
      <ProTable<MembershipRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = (await membershipsApi.getAll({
            page: params.current,
            pageSize: params.pageSize,
          })) as unknown as { data: MembershipRecord[]; total: number };
          return { data: res.data, total: res.total, success: true };
        }}
        toolbar={{
          actions: [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              提交会员申请
            </Button>,
          ],
        }}
      />
      <Drawer
        title="提交会员申请"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
        }}
        width={480}
        footer={
          <Button
            type="primary"
            loading={createMutation.isPending}
            onClick={() => form.submit()}
          >
            提交
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
        >
          <Form.Item name="customerId" label="选择客户" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={customersData.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.phone})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="memberLevelId" label="会员等级">
            <Select
              allowClear
              options={levelsData.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="fee" label="会员费（元）" rules={[{ required: true }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="dateRange" label="有效期" rules={[{ required: true }]}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
