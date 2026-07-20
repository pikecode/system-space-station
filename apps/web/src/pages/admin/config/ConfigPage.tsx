import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Form, InputNumber, DatePicker, Input, Card, Row, Col, App, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: current } = useQuery({
    queryKey: ['config-current'],
    queryFn: () => configApi.getCurrent(),
  });
  const { data: versions } = useQuery({
    queryKey: ['config-versions'],
    queryFn: () => configApi.getVersions(),
  });

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
      qc.invalidateQueries({ queryKey: ['config-current'] });
      qc.invalidateQueries({ queryKey: ['config-versions'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '保存失败');
    },
  });

  const curr = current as CurrentConfig | undefined;
  const versionList: ConfigVersion[] = Array.isArray(versions)
    ? (versions as ConfigVersion[])
    : [];

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
      {curr && (
        <Card title="当前生效配置" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <div style={{ color: '#999', fontSize: 12 }}>维护人</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{curr.memberRatio}%</div>
            </Col>
            <Col span={4}>
              <div style={{ color: '#999', fontSize: 12 }}>事业部负责人</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{curr.deptHeadRatio}%</div>
            </Col>
            <Col span={4}>
              <div style={{ color: '#999', fontSize: 12 }}>市场部负责人</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{curr.marketHeadRatio}%</div>
            </Col>
            <Col span={4}>
              <div style={{ color: '#999', fontSize: 12 }}>公司</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{curr.companyRatio}%</div>
            </Col>
            <Col span={4}>
              <div style={{ color: '#999', fontSize: 12 }}>结算周期</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{curr.settlementDays}天</div>
            </Col>
          </Row>
        </Card>
      )}

      <ProTable<ConfigVersion>
        rowKey="id"
        columns={columns}
        dataSource={versionList}
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
          <Button
            type="primary"
            loading={createMutation.isPending}
            onClick={() => form.submit()}
          >
            保存
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
          initialValues={{ settlementDays: 15, effectiveFrom: dayjs().add(1, 'day') }}
        >
          <Form.Item style={{ marginBottom: 8 }}>
            <span style={{ color: '#999', fontSize: 12 }}>
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
