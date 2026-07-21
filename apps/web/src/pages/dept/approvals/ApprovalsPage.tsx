import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { App, Button, DatePicker, Descriptions, Form, Input, Modal, Space, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { membershipsApi } from '../../../services/memberships';

type ApprovalAction = 'approve' | 'reject' | 'refundApprove' | 'refundReject';

interface MembershipPending {
  id: string;
  status: 'PENDING' | 'REFUND_PENDING';
  fee: string | number;
  startDate: string;
  endDate: string;
  createdAt: string;
  refundReason?: string;
  customer?: { name: string; phone: string };
  submitter?: { name: string };
}

interface ReviewFormValues {
  paidAt?: dayjs.Dayjs;
  reviewNote?: string;
}

export default function ApprovalsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<MembershipPending | null>(null);
  const [action, setAction] = useState<ApprovalAction | null>(null);
  const [form] = Form.useForm<ReviewFormValues>();

  const { data: pending, isLoading, refetch } = useQuery({
    queryKey: ['memberships-pending'],
    queryFn: () => membershipsApi.getPending(),
  });

  const mutation = useMutation({
    mutationFn: async ({ record, currentAction, values }: {
      record: MembershipPending;
      currentAction: ApprovalAction;
      values: ReviewFormValues;
    }) => {
      if (currentAction === 'approve') {
        return membershipsApi.approve(record.id, {
          paidAt: values.paidAt?.toISOString(),
          reviewNote: values.reviewNote,
        });
      }
      if (currentAction === 'reject') {
        return membershipsApi.reject(record.id, { reviewNote: values.reviewNote });
      }
      if (currentAction === 'refundApprove') {
        return membershipsApi.approveRefund(record.id);
      }
      return membershipsApi.rejectRefund(record.id, { reviewNote: values.reviewNote });
    },
    onSuccess: () => {
      message.success('审批操作已完成');
      closeModal();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['department-commissions'] });
    },
    onError: (error: unknown) => {
      const responseError = error as { response?: { data?: { message?: string } } };
      message.error(responseError.response?.data?.message ?? '操作失败');
    },
  });

  const list: MembershipPending[] = Array.isArray(pending) ? pending as MembershipPending[] : [];

  const openAction = (record: MembershipPending, nextAction: ApprovalAction) => {
    setSelected(record);
    setAction(nextAction);
    form.resetFields();
    if (nextAction === 'approve') form.setFieldValue('paidAt', dayjs());
  };

  const closeModal = () => {
    setSelected(null);
    setAction(null);
    form.resetFields();
  };

  const columns: ProColumns<MembershipPending>[] = [
    { title: '客户', dataIndex: ['customer', 'name'], width: 100, fixed: 'left' },
    {
      title: '类型',
      dataIndex: 'status',
      width: 90,
      render: (_, record) => (
        <Tag color={record.status === 'PENDING' ? 'blue' : 'orange'}>
          {record.status === 'PENDING' ? '入会审批' : '退款审批'}
        </Tag>
      ),
    },
    {
      title: '会员费',
      dataIndex: 'fee',
      width: 100,
      render: (_, record) => `¥${Number(record.fee).toLocaleString()}`,
    },
    { title: '手机', dataIndex: ['customer', 'phone'], width: 130, responsive: ['md'] },
    {
      title: '有效期',
      width: 200,
      responsive: ['md'],
      render: (_, record) =>
        `${record.startDate?.slice(0, 10)} ~ ${record.endDate?.slice(0, 10)}`,
    },
    { title: '申请人', dataIndex: ['submitter', 'name'], width: 90, responsive: ['md'] },
    { title: '退款原因', dataIndex: 'refundReason', width: 160, search: false, responsive: ['lg'] },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 150,
      responsive: ['lg'],
      render: (_, record) => record.createdAt?.slice(0, 16).replace('T', ' '),
    },
    {
      /* Width bumped from 80 to 140 to fit labeled text buttons.
         Rationale: the approve/reject action is THE reason this page exists.
         Icon-only 24px buttons are the smallest element on the page for the
         most important operation — that hierarchy is inverted. Text labels
         also remove the need for Tooltip on hover. */
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            disabled={mutation.isPending}
            onClick={() => openAction(record, record.status === 'PENDING' ? 'approve' : 'refundApprove')}
          >
            通过
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            disabled={mutation.isPending}
            onClick={() => openAction(record, record.status === 'PENDING' ? 'reject' : 'refundReject')}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  const isReject = action === 'reject' || action === 'refundReject';
  const isApproveMembership = action === 'approve';

  return (
    <>
      <ProTable<MembershipPending>
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={isLoading}
        search={false}
        pagination={false}
        headerTitle={`待审批 ${list.length} 条`}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={isReject ? '确认拒绝' : '确认审批通过'}
        open={!!action}
        onCancel={closeModal}
        footer={null}
      >
        {selected && (
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="客户">{selected.customer?.name}</Descriptions.Item>
            <Descriptions.Item label="会员费">
              ¥{Number(selected.fee).toLocaleString()}
            </Descriptions.Item>
            {selected.refundReason && (
              <Descriptions.Item label="退款原因">{selected.refundReason}</Descriptions.Item>
            )}
          </Descriptions>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (selected && action) {
              mutation.mutate({ record: selected, currentAction: action, values });
            }
          }}
        >
          {isApproveMembership && (
            <Form.Item name="paidAt" label="实际收款时间" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          )}
          {(isReject || isApproveMembership) && (
            <Form.Item
              name="reviewNote"
              label={isReject ? '拒绝原因' : '审批备注'}
              rules={isReject ? [{ required: true }] : []}
            >
              <Input.TextArea rows={3} maxLength={500} showCount />
            </Form.Item>
          )}
          <Button
            type="primary"
            danger={isReject}
            htmlType="submit"
            loading={mutation.isPending}
            block
          >
            确认{isReject ? '拒绝' : '通过'}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
