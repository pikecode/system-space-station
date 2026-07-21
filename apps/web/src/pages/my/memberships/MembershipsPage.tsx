import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { App, Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select, Space, Tag, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { membershipsApi } from '../../../services/memberships';
import { customersApi } from '../../../services/customers';
import { memberLevelsApi } from '../../../services/memberLevels';

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
  customer?: { id: string; name: string };
  memberLevel?: { id: string; name: string };
}

interface MembershipFormValues {
  customerId: string;
  memberLevelId?: string;
  fee: number;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export default function MembershipsPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MembershipRecord | null>(null);
  const [refundTarget, setRefundTarget] = useState<MembershipRecord | null>(null);
  const [form] = Form.useForm<MembershipFormValues>();
  const [refundForm] = Form.useForm<{ refundReason: string }>();

  const { data: customers } = useQuery({
    queryKey: ['my-customers'],
    queryFn: () => customersApi.getAll({ pageSize: 100 }),
  });
  const { data: levels } = useQuery({
    queryKey: ['member-levels'],
    queryFn: () => memberLevelsApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: MembershipFormValues) => {
      const payload = {
        customerId: values.customerId,
        memberLevelId: values.memberLevelId,
        fee: values.fee,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      return editingRecord
        ? membershipsApi.resubmit(editingRecord.id, payload)
        : membershipsApi.create(payload);
    },
    onSuccess: () => {
      message.success(editingRecord ? '已重新提交' : '提交成功，等待负责人审批');
      closeDrawer();
      actionRef.current?.reload();
    },
    onError: (error: unknown) => message.error(apiError(error, '提交失败')),
  });

  const refundMutation = useMutation({
    mutationFn: (refundReason: string) =>
      membershipsApi.requestRefund(refundTarget!.id, { refundReason }),
    onSuccess: () => {
      message.success('退款申请已提交');
      setRefundTarget(null);
      refundForm.resetFields();
      actionRef.current?.reload();
    },
    onError: (error: unknown) => message.error(apiError(error, '退款申请失败')),
  });

  const customerList =
    (customers as { data?: Array<{ id: string; name: string; phone: string }> } | undefined)?.data ?? [];
  const levelList = Array.isArray(levels) ? (levels as Array<{ id: string; name: string }>) : [];

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openResubmit = (record: MembershipRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      customerId: record.customer?.id ?? '',
      memberLevelId: record.memberLevel?.id,
      fee: Number(record.fee),
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const columns: ProColumns<MembershipRecord>[] = [
    { title: '客户', dataIndex: ['customer', 'name'], width: 100, fixed: 'left' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (_, record) => (
        <Tag color={STATUS_COLORS[record.status]}>{STATUS_LABELS[record.status]}</Tag>
      ),
    },
    {
      title: '会员费',
      dataIndex: 'fee',
      width: 100,
      render: (_, record) => `¥${Number(record.fee).toLocaleString()}`,
    },
    { title: '会员编号', dataIndex: 'memberNo', width: 140, responsive: ['md'] },
    { title: '会员等级', dataIndex: ['memberLevel', 'name'], width: 100, responsive: ['md'] },
    {
      title: '有效期',
      width: 200,
      responsive: ['md'],
      render: (_, record) =>
        `${record.startDate?.slice(0, 10)} ~ ${record.endDate?.slice(0, 10)}`,
    },
    { title: '审批备注', dataIndex: 'reviewNote', width: 150, search: false, responsive: ['lg'] },
    {
      title: '操作',
      width: 80,
      search: false,
      render: (_, record) => (
        <Space size={4}>
          {record.status === 'REJECTED' && (
            <Tooltip title="修改重提">
              <Button size="small" icon={<EditOutlined />} onClick={() => openResubmit(record)} />
            </Tooltip>
          )}
          {record.status === 'APPROVED' && (
            <Tooltip title="申请退款">
              <Button size="small" danger icon={<RollbackOutlined />} onClick={() => setRefundTarget(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<MembershipRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const response = (await membershipsApi.getAll({
            page: params.current,
            pageSize: params.pageSize,
          })) as unknown as { data: MembershipRecord[]; total: number };
          return { data: response.data, total: response.total, success: true };
        }}
        toolbar={{
          actions: [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              提交会员申请
            </Button>,
          ],
        }}
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        title={editingRecord ? '修改并重新提交' : '提交会员申请'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={480}
        footer={(
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
              {editingRecord ? '重新提交' : '提交'}
            </Button>
          </div>
        )}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          <Form.Item name="customerId" label="选择客户" rules={[{ required: true }]}>
            <Select
              disabled={!!editingRecord}
              showSearch
              optionFilterProp="label"
              options={customerList.map((customer) => ({
                value: customer.id,
                label: `${customer.name} (${customer.phone})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="memberLevelId" label="会员等级">
            <Select
              allowClear
              options={levelList.map((level) => ({ value: level.id, label: level.name }))}
            />
          </Form.Item>
          <Form.Item name="fee" label="会员费（元）" rules={[{ required: true }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="dateRange" label="有效期" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={`申请全额退款：${refundTarget?.customer?.name ?? ''}`}
        open={!!refundTarget}
        confirmLoading={refundMutation.isPending}
        onCancel={() => {
          setRefundTarget(null);
          refundForm.resetFields();
        }}
        onOk={() => refundForm.submit()}
      >
        <Form
          form={refundForm}
          layout="vertical"
          onFinish={(values) => refundMutation.mutate(values.refundReason)}
        >
          <Form.Item name="refundReason" label="退款原因" rules={[{ required: true }]}>
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function apiError(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } } };
  return responseError.response?.data?.message ?? fallback;
}
