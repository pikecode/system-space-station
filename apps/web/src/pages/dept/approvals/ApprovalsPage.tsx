import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Space, App, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipsApi } from '../../../services/memberships';

interface MembershipPending {
  id: string;
  fee: string | number;
  startDate: string;
  endDate: string;
  createdAt: string;
  customer?: { name: string; phone: string };
  submitter?: { name: string };
}

export default function ApprovalsPage() {
  const { message } = App.useApp();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<MembershipPending | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [form] = Form.useForm();

  const { data: pending, isLoading, refetch } = useQuery({
    queryKey: ['memberships-pending'],
    queryFn: () => membershipsApi.getPending(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      membershipsApi.approve(id, { reviewNote: note }),
    onSuccess: () => {
      message.success('审批通过');
      setAction(null);
      setSelected(null);
      refetch();
      qc.invalidateQueries({ queryKey: ['memberships'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      membershipsApi.reject(id, { reviewNote: note }),
    onSuccess: () => {
      message.success('已拒绝');
      setAction(null);
      setSelected(null);
      refetch();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const list: MembershipPending[] = Array.isArray(pending) ? (pending as MembershipPending[]) : [];

  const columns: ProColumns<MembershipPending>[] = [
    { title: '客户', dataIndex: ['customer', 'name'], width: 100 },
    { title: '手机', dataIndex: ['customer', 'phone'], width: 130 },
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
    { title: '申请人', dataIndex: ['submitter', 'name'], width: 90 },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (_, r) => r.createdAt?.slice(0, 16).replace('T', ' '),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              setSelected(r);
              setAction('approve');
              form.resetFields();
            }}
          >
            通过
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setSelected(r);
              setAction('reject');
              form.resetFields();
            }}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

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
        scroll={{ x: 900 }}
      />

      <Modal
        title={action === 'approve' ? '确认审批通过' : '确认拒绝'}
        open={!!action}
        onCancel={() => {
          setAction(null);
          form.resetFields();
        }}
        footer={null}
      >
        {selected && (
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="客户">{selected.customer?.name}</Descriptions.Item>
            <Descriptions.Item label="会员费">
              ¥{Number(selected.fee).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="有效期">
              {selected.startDate?.slice(0, 10)} ~ {selected.endDate?.slice(0, 10)}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            if (!selected) return;
            if (action === 'approve') {
              approveMutation.mutate({ id: selected.id, note: v.reviewNote });
            } else {
              rejectMutation.mutate({ id: selected.id, note: v.reviewNote });
            }
          }}
        >
          <Form.Item
            name="reviewNote"
            label={action === 'reject' ? '拒绝原因（必填）' : '备注（选填）'}
            rules={action === 'reject' ? [{ required: true }] : []}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button
            type="primary"
            danger={action === 'reject'}
            htmlType="submit"
            loading={approveMutation.isPending || rejectMutation.isPending}
            block
          >
            确认{action === 'approve' ? '通过' : '拒绝'}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
