import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  App,
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Statistic,
  Tabs,
  Tag,
} from 'antd';
import { PlusOutlined, CheckCircleOutlined, PayCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ProTable from '../../../components/BusinessProTable';
import {
  investmentsApi,
  type CustomerInvestment,
  type CustomerProfitRecord,
  type InvestmentProduct,
  type ProductYieldPeriod,
  type ProfitShareConfig,
} from '../../../services/investments';

const MONEY = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

const PRODUCT_STATUS: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '启用',
  CLOSED: '关闭',
  ARCHIVED: '归档',
};

const PROFIT_STATUS: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  SETTLED: '已结算',
  GENERATED: '已生成',
};

function money(value?: string | number | null) {
  return MONEY.format(Number(value ?? 0));
}

function date(value?: string | null) {
  return value ? value.slice(0, 10) : '-';
}

function statusTag(value: string) {
  const color = value === 'ACTIVE' || value === 'CONFIRMED' || value === 'SETTLED' || value === 'GENERATED'
    ? 'green'
    : value === 'DRAFT'
      ? 'gold'
      : 'default';
  return <Tag color={color}>{PRODUCT_STATUS[value] ?? PROFIT_STATUS[value] ?? value}</Tag>;
}

export default function AdminInvestmentsPage() {
  const { message } = App.useApp();
  const productRef = useRef<ActionType>();
  const investmentRef = useRef<ActionType>();
  const yieldRef = useRef<ActionType>();
  const profitRef = useRef<ActionType>();
  const configRef = useRef<ActionType>();
  const [drawer, setDrawer] = useState<'product' | 'investment' | 'yield' | 'config' | null>(null);
  const [form] = Form.useForm();

  const closeDrawer = () => {
    setDrawer(null);
    form.resetFields();
  };

  const reloadAll = () => {
    productRef.current?.reload();
    investmentRef.current?.reload();
    yieldRef.current?.reload();
    profitRef.current?.reload();
    configRef.current?.reload();
  };

  const createMutation = useMutation({
    mutationFn: (values: any) => {
      if (drawer === 'product') {
        return investmentsApi.createProduct({
          ...values,
          expectedStartAt: values.expectedStartAt?.format('YYYY-MM-DD'),
          expectedEndAt: values.expectedEndAt?.format('YYYY-MM-DD'),
        });
      }
      if (drawer === 'investment') {
        return investmentsApi.createCustomerInvestment({
          ...values,
          investedAt: values.investedAt.format('YYYY-MM-DD'),
        });
      }
      if (drawer === 'yield') {
        return investmentsApi.createYieldPeriod({
          ...values,
          periodStart: values.periodStart.format('YYYY-MM-DD'),
          periodEnd: values.periodEnd.format('YYYY-MM-DD'),
        });
      }
      return investmentsApi.createConfig({
        ...values,
        effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
      });
    },
    onSuccess: () => {
      message.success('保存成功');
      closeDrawer();
      reloadAll();
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '保存失败'),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => investmentsApi.confirmYieldPeriod(id),
    onSuccess: () => {
      message.success('收益已确认并生成客户收益');
      reloadAll();
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '确认失败'),
  });

  const settleMutation = useMutation({
    mutationFn: (id: string) => investmentsApi.settleProfit(id),
    onSuccess: () => {
      message.success('收益已手动结算');
      reloadAll();
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '结算失败'),
  });

  const productColumns: ProColumns<InvestmentProduct>[] = [
    { title: '产品编号', dataIndex: 'productNo', width: 130 },
    { title: '产品名称', dataIndex: 'name', width: 180 },
    { title: '类型', dataIndex: 'productType', width: 120 },
    { title: '起投金额', dataIndex: 'minAmount', width: 120, render: (_, r) => money(r.minAmount) },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
    { title: '预计周期', width: 180, render: (_, r) => `${date(r.expectedStartAt)} 至 ${date(r.expectedEndAt)}` },
  ];

  const investmentColumns: ProColumns<CustomerInvestment>[] = [
    { title: '投资编号', dataIndex: 'investmentNo', width: 150 },
    { title: '客户', width: 180, render: (_, r) => r.customer.name },
    { title: '产品', width: 180, render: (_, r) => r.product.name },
    { title: '投资金额', dataIndex: 'amount', width: 130, render: (_, r) => money(r.amount) },
    { title: '投资日期', dataIndex: 'investedAt', width: 110, render: (_, r) => date(r.investedAt) },
    { title: '签约人编号', dataIndex: 'contractedEmployeeNo', width: 120 },
    { title: '录入人编号', dataIndex: 'createdEmployeeNo', width: 120 },
  ];

  const yieldColumns: ProColumns<ProductYieldPeriod>[] = [
    { title: '产品', width: 180, render: (_, r) => r.product.name },
    { title: '收益周期', width: 190, render: (_, r) => `${date(r.periodStart)} 至 ${date(r.periodEnd)}` },
    { title: '产品总收益', dataIndex: 'totalProfit', width: 130, render: (_, r) => money(r.totalProfit) },
    { title: '状态', dataIndex: 'status', width: 100, render: (_, r) => statusTag(r.status) },
    { title: '客户收益数', width: 100, render: (_, r) => r._count?.profitRecords ?? 0 },
    {
      title: '操作',
      width: 120,
      render: (_, r) => r.status === 'DRAFT' && (
        <Button
          size="small"
          icon={<CheckCircleOutlined />}
          loading={confirmMutation.isPending}
          onClick={() => confirmMutation.mutate(r.id)}
        >
          确认
        </Button>
      ),
    },
  ];

  const profitColumns: ProColumns<CustomerProfitRecord>[] = [
    { title: '客户', width: 180, render: (_, r) => r.customer.name },
    { title: '产品', width: 180, render: (_, r) => r.product.name },
    { title: '周期', width: 190, render: (_, r) => `${date(r.yieldPeriod.periodStart)} 至 ${date(r.yieldPeriod.periodEnd)}` },
    { title: '投资本金', dataIndex: 'principalAmount', width: 130, render: (_, r) => money(r.principalAmount) },
    { title: '客户毛收益', dataIndex: 'profitAmount', width: 130, render: (_, r) => money(r.profitAmount) },
    { title: '客户到账', dataIndex: 'customerAmount', width: 130, render: (_, r) => money(r.customerAmount) },
    { title: '状态', dataIndex: 'status', width: 100, render: (_, r) => statusTag(r.status) },
    {
      title: '操作',
      width: 120,
      render: (_, r) => r.status === 'GENERATED' && (
        <Button
          size="small"
          icon={<PayCircleOutlined />}
          loading={settleMutation.isPending}
          onClick={() => settleMutation.mutate(r.id)}
        >
          结算
        </Button>
      ),
    },
  ];

  const configColumns: ProColumns<ProfitShareConfig>[] = [
    { title: '客户', dataIndex: 'customerRatio', width: 90, render: (_, r) => `${r.customerRatio}%` },
    { title: '部门', dataIndex: 'departmentRatio', width: 90, render: (_, r) => `${r.departmentRatio}%` },
    { title: '签约人', dataIndex: 'contractedUserRatio', width: 100, render: (_, r) => `${r.contractedUserRatio}%` },
    { title: '录入人', dataIndex: 'createdUserRatio', width: 100, render: (_, r) => `${r.createdUserRatio}%` },
    { title: '公司', dataIndex: 'companyRatio', width: 90, render: (_, r) => `${r.companyRatio}%` },
    { title: '生效时间', dataIndex: 'effectiveFrom', width: 120, render: (_, r) => date(r.effectiveFrom) },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space size={32} wrap>
          <Statistic title="收益录入方式" value="产品总收益" />
          <Statistic title="分配方式" value="全局统一比例" />
          <Statistic title="结算方式" value="手动结算" />
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: 'products',
            label: '产品',
            children: (
              <ProTable<InvestmentProduct>
                actionRef={productRef}
                rowKey="id"
                search={false}
                columns={productColumns}
                request={async () => {
                  const data = await investmentsApi.products();
                  return { data, success: true, total: data.length };
                }}
                toolbar={{ actions: [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setDrawer('product')}>新增产品</Button>] }}
              />
            ),
          },
          {
            key: 'investments',
            label: '客户投资',
            children: (
              <ProTable<CustomerInvestment>
                actionRef={investmentRef}
                rowKey="id"
                search={false}
                columns={investmentColumns}
                request={async () => {
                  const data = await investmentsApi.customerInvestments();
                  return { data, success: true, total: data.length };
                }}
                toolbar={{ actions: [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setDrawer('investment')}>新增投资</Button>] }}
              />
            ),
          },
          {
            key: 'yields',
            label: '产品收益',
            children: (
              <ProTable<ProductYieldPeriod>
                actionRef={yieldRef}
                rowKey="id"
                search={false}
                columns={yieldColumns}
                request={async () => {
                  const data = await investmentsApi.yieldPeriods();
                  return { data, success: true, total: data.length };
                }}
                toolbar={{ actions: [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setDrawer('yield')}>录入收益</Button>] }}
              />
            ),
          },
          {
            key: 'profits',
            label: '客户收益',
            children: (
              <ProTable<CustomerProfitRecord>
                actionRef={profitRef}
                rowKey="id"
                search={false}
                columns={profitColumns}
                request={async () => {
                  const data = await investmentsApi.profits();
                  return { data, success: true, total: data.length };
                }}
              />
            ),
          },
          {
            key: 'configs',
            label: '分配比例',
            children: (
              <ProTable<ProfitShareConfig>
                actionRef={configRef}
                rowKey="id"
                search={false}
                columns={configColumns}
                request={async () => {
                  const data = await investmentsApi.configs();
                  return { data, success: true, total: data.length };
                }}
                toolbar={{ actions: [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setDrawer('config')}>新增比例</Button>] }}
              />
            ),
          },
        ]}
      />

      <Drawer
        title={drawer === 'product' ? '新增产品' : drawer === 'investment' ? '新增客户投资' : drawer === 'yield' ? '录入产品收益' : '新增收益分配比例'}
        open={!!drawer}
        width={520}
        onClose={closeDrawer}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={closeDrawer}>取消</Button>
              <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>保存</Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate(values)}>
          {drawer === 'product' && (
            <>
              <Form.Item name="productNo" label="产品编号" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="name" label="产品名称" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="productType" label="产品类型"><Input /></Form.Item>
              <Form.Item name="minAmount" label="起投金额"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="status" label="状态" initialValue="ACTIVE"><Select options={[{ label: '启用', value: 'ACTIVE' }, { label: '草稿', value: 'DRAFT' }]} /></Form.Item>
              <Form.Item name="expectedStartAt" label="预计开始"><DatePicker style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="expectedEndAt" label="预计结束"><DatePicker style={{ width: '100%' }} /></Form.Item>
            </>
          )}
          {drawer === 'investment' && (
            <>
              <Form.Item name="customerId" label="客户 ID" rules={[{ required: true }]}><Input placeholder="正式会员客户 ID" /></Form.Item>
              <Form.Item name="productId" label="产品 ID" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="amount" label="投资金额" rules={[{ required: true }]}><InputNumber min={0.01} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="investedAt" label="投资日期" rules={[{ required: true }]} initialValue={dayjs()}><DatePicker style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="contractedEmployeeNo" label="签约人编号"><Input placeholder="为空则使用客户签约人快照" /></Form.Item>
            </>
          )}
          {drawer === 'yield' && (
            <>
              <Form.Item name="productId" label="产品 ID" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="periodStart" label="周期开始" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="periodEnd" label="周期结束" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="totalProfit" label="产品总收益" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
            </>
          )}
          {drawer === 'config' && (
            <>
              <Form.Item name="customerRatio" label="客户比例" rules={[{ required: true }]}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="departmentRatio" label="部门比例" rules={[{ required: true }]}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="contractedUserRatio" label="签约人比例" rules={[{ required: true }]}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="createdUserRatio" label="录入人比例" rules={[{ required: true }]}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="companyRatio" label="公司比例" rules={[{ required: true }]}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="effectiveFrom" label="生效时间" rules={[{ required: true }]} initialValue={dayjs()}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </>
          )}
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
