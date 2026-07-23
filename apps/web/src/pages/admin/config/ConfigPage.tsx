import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Form, InputNumber, DatePicker, Input, Card, Row, Col, App, Drawer, Statistic } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { configApi } from '../../../services/config';
import dayjs from 'dayjs';

interface ConfigVersion {
  id: string;
  memberRatio: number;
  deptHeadRatio: number;
  marketHeadRatio: number;
  companyRatio: number;
  settlementDays: number;
  effectiveFrom: string;
  remark?: string;
}

interface CurrentConfig extends ConfigVersion {
  // same shape as version
}

export default function ConfigPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [current, setCurrent] = useState<CurrentConfig>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const createMutation = useMutation({
    mutationFn: (data: { memberRatio: number; deptHeadRatio: number; marketHeadRatio: number; companyRatio: number; settlementDays: number; effectiveFrom: dayjs.Dayjs; remark?: string }) =>
      configApi.create({
        ...data,
        effectiveFrom: data.effectiveFrom.format('YYYY-MM-DD'),
      }),
    onSuccess: () => {
      message.success('配置已保存');
      setDrawerOpen(false);
      form.resetFields();
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '保存失败');
    },
  });

  const columns: ProColumns<ConfigVersion>[] = [
    {
      title: '维护人比例',
      dataIndex: 'memberRatio',
      width: 100,
      render: (_, r) => `${r.memberRatio}%`,
    },
    {
      title: '事业部负责人',
      dataIndex: 'deptHeadRatio',
      width: 120,
      render: (_, r) => `${r.deptHeadRatio}%`,
    },
    {
      title: '市场部负责人',
      dataIndex: 'marketHeadRatio',
      width: 120,
      render: (_, r) => `${r.marketHeadRatio}%`,
    },
    {
      title: '公司',
      dataIndex: 'companyRatio',
      width: 80,
      render: (_, r) => `${r.companyRatio}%`,
    },
    { title: '结算天数', dataIndex: 'settlementDays', width: 90 },
    {
      title: '生效时间',
      dataIndex: 'effectiveFrom',
      width: 120,
      render: (_, r) => r.effectiveFrom?.slice(0, 10),
    },
    { title: '备注', dataIndex: 'remark', width: 150 },
  ];

  return (
    <>
      {current && (
        /* Statistic replaces custom divs: consistent title/value hierarchy,
           gutter bumped to 24 so numbers breathe, responsive cols for mobile. */
        <Card title="当前生效配置" style={{ marginBottom: 'var(--space-md)' }}>
          <Row gutter={[24, 16]}>
            <Col xs={12} sm={8} md={5}>
              <Statistic title="维护人" value={current.memberRatio} suffix="%" />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic title="事业部负责人" value={current.deptHeadRatio} suffix="%" />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic title="市场部负责人" value={current.marketHeadRatio} suffix="%" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Statistic title="公司" value={current.companyRatio} suffix="%" />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Statistic title="结算周期" value={current.settlementDays} suffix="天" />
            </Col>
          </Row>
        </Card>
      )}

      <ProTable<ConfigVersion>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const [versionsResponse, currentResponse] = await Promise.all([
            configApi.getVersions(),
            configApi.getCurrent(),
          ]);
          const versions = Array.isArray(versionsResponse)
            ? versionsResponse as ConfigVersion[]
            : [];
          setCurrent(currentResponse as unknown as CurrentConfig);
          return { data: versions, success: true, total: versions.length };
        }}
        search={false}
        pagination={false}
        headerTitle="配置历史"
        toolbar={{
          actions: [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
            >
              新增配置版本
            </Button>,
          ],
        }}
        scroll={{ x: 800 }}
      />

      <Drawer
        title="新增分成配置版本"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
        }}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              loading={createMutation.isPending}
              onClick={() => form.submit()}
            >
              保存
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
          initialValues={{ settlementDays: 15, effectiveFrom: dayjs().add(1, 'day') }}
        >
          <Form.Item style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--color-ink-2)', fontSize: 'var(--text-xs)' }}>
              四项比例之和必须等于100%，配置按生效时间自动选取
            </span>
          </Form.Item>
          <Form.Item name="memberRatio" label="维护人比例（%）" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="deptHeadRatio"
            label="事业部负责人比例（%）"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="marketHeadRatio"
            label="市场部负责人比例（%）"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="companyRatio" label="公司比例（%）" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="settlementDays" label="结算周期（天）" rules={[{ required: true }]}>
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="effectiveFrom" label="生效时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
