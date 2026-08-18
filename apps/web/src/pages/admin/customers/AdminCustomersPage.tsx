import { useDeferredValue, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Alert, App, Button, Card, DatePicker, Descriptions, Drawer, Form, Input, InputNumber,
  Popconfirm, Select, Space, Switch, Tag,
  Statistic, Tabs,
} from 'antd';
import {
  CheckCircleOutlined, EditOutlined, FundProjectionScreenOutlined, PlusOutlined, StopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import ProTable from '../../../components/BusinessProTable';
import { customersApi } from '../../../services/customers';
import {
  investmentsApi,
  type CustomerInvestment,
  type CustomerProfitRecord,
  type InvestmentCommissionRecord,
  type ProfitShareRecord,
} from '../../../services/investments';
import { usersApi } from '../../../services/users';
import {
  CustomerStatus,
  type CreateCustomerPayloadDto,
  type UpdateCustomerPayloadDto,
} from 'shared';
import { getApiErrorMessage } from '../../../utils/apiError';

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

const MONEY = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '意向客户',
  INACTIVE: '停用',
  ACTIVE_MEMBER: '正式会员',
  PROSPECT: '意向会员',
  GENERATED: '已生成',
  SETTLED: '已结算',
  DRAFT: '草稿',
  CONFIRMED: '已确认',
};

const PROFIT_RECEIVER_LABELS: Record<string, string> = {
  CUSTOMER: '客户',
  DEPARTMENT: '签约部门',
  CONTRACTED_USER: '签约人',
  CREATED_USER: '录入人',
  COMPANY: '公司',
};

const INVESTMENT_COMMISSION_RECEIVER_LABELS: Record<string, string> = {
  CONTRACTED_DEPARTMENT: '签约部门',
  CONTRACTED_USER: '签约人',
  COMPANY: '公司',
};

function money(value?: string | number | null) {
  return MONEY.format(Number(value ?? 0));
}

function date(value?: string | null) {
  return value ? value.slice(0, 10) : '-';
}

function statusTag(value: string) {
  const color = value === 'ACTIVE' || value === 'ACTIVE_MEMBER' || value === 'CONFIRMED' || value === 'SETTLED' || value === 'GENERATED'
    ? 'green'
    : value === 'PROSPECT' || value === 'DRAFT'
      ? 'gold'
      : 'default';
  return <Tag color={color}>{STATUS_LABELS[value] ?? value}</Tag>;
}

interface CustomerRow {
  id: string; name: string; phone: string;
  customerType: string; source: string; status: CustomerStatus;
  wechat?: string; gender?: string; birthday?: string; address?: string; idCard?: string;
  creditCode?: string; industry?: string; contactName?: string; contactPhone?: string;
  legalPerson?: string; registeredCapital?: string;
  riskTolerance?: string; isAccreditedInvestor?: boolean; investmentAmount?: string;
  customerNo?: string | null;
  tags?: string; notes?: string;
  department?: { id: string; name: string };
  assignedUser?: { id: string; name: string };
}

export default function AdminCustomersPage() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [investmentForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [investmentDrawerOpen, setInvestmentDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assetCustomer, setAssetCustomer] = useState<CustomerRow | null>(null);
  const [customerStatusTab, setCustomerStatusTab] = useState<'ALL' | CustomerStatus.PROSPECT | CustomerStatus.ACTIVE_MEMBER | CustomerStatus.INACTIVE>('ALL');
  const [custType, setCustType] = useState<string>('INDIVIDUAL');
  const [ownerKeyword, setOwnerKeyword] = useState('');
  const deferredOwnerKeyword = useDeferredValue(ownerKeyword);

  const { data: userOpts = [], isLoading: ownerOptionsLoading } = useQuery({
    queryKey: ['users-simple', deferredOwnerKeyword],
    queryFn: () => usersApi.getCustomerOwners(deferredOwnerKeyword || undefined),
    select: (users) => users.map((user) => ({
      label: `${user.name}（${user.phone ?? '无手机号'}）`,
      value: user.id,
    })),
  });

  const productOptionsQuery = useQuery({
    queryKey: ['investment-products-options'],
    queryFn: () => investmentsApi.products(),
  });

  const customerAssetsQuery = useQuery({
    queryKey: ['admin-customer-assets', assetCustomer?.id],
    queryFn: () => customersApi.getAssets(assetCustomer!.id),
    enabled: !!assetCustomer,
  });

  const createMut = useMutation({
    mutationFn: (data: CreateCustomerPayloadDto) => customersApi.create(data),
    onSuccess: () => { message.success('创建成功'); closeDrawer(); actionRef.current?.reload(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayloadDto }) => customersApi.update(id, data),
    onSuccess: () => { message.success('保存成功'); closeDrawer(); actionRef.current?.reload(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: CustomerStatus }) => (
      currentStatus === CustomerStatus.INACTIVE
        ? customersApi.restore(id)
        : customersApi.disable(id)
    ),
    onSuccess: () => { message.success('状态已更新'); actionRef.current?.reload(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });
  const createInvestmentMut = useMutation({
    mutationFn: async () => {
      if (!assetCustomer) throw new Error('请先选择客户');
      const values = await investmentForm.validateFields();
      return investmentsApi.createCustomerInvestment({
        ...values,
        customerId: assetCustomer.id,
        investedAt: values.investedAt.format('YYYY-MM-DD'),
      });
    },
    onSuccess: (result) => {
      message.success('投资记录已创建');
      setInvestmentDrawerOpen(false);
      investmentForm.resetFields();
      customerAssetsQuery.refetch();
      actionRef.current?.reload();
      if (result.customerLogin) {
        setAssetCustomer((current) => current
          ? { ...current, status: CustomerStatus.ACTIVE_MEMBER, customerNo: result.customerLogin?.customerNo }
          : current);
      }
      if (result.customerLogin?.initialPassword) {
        modal.success({
          title: '客户已成为正式会员',
          content: (
            <Space direction="vertical" size={4}>
              <div>客户编号：{result.customerLogin.customerNo}</div>
              <div>初始密码：{result.customerLogin.initialPassword}</div>
              <div>请将编号和密码提供给客户，客户可用于小程序登录。</div>
            </Space>
          ),
        });
      }
    },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '创建投资失败')),
  });
  const resetPasswordMut = useMutation({
    mutationFn: () => customersApi.resetPassword(assetCustomer!.id),
    onSuccess: (result) => {
      modal.success({
        title: '客户密码已重置',
        content: (
          <Space direction="vertical" size={4}>
            <div>客户编号：{result.customerNo ?? '-'}</div>
            <div>新密码：{result.initialPassword}</div>
            <div>请将新密码提供给客户。</div>
          </Space>
        ),
      });
    },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '重置密码失败')),
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
  const assetCustomerDetail = customerAssetsQuery.data?.customer ?? assetCustomer!;
  const assetInvestments = customerAssetsQuery.data?.investments ?? [];
  const assetCommissions = customerAssetsQuery.data?.investmentCommissions ?? [];
  const assetProfits = customerAssetsQuery.data?.profitRecords ?? [];
  const assetInvestmentTotal = assetInvestments.reduce((sum, item) => sum + Number(item.amount), 0);
  const assetCommissionTotal = assetCommissions.reduce((sum, item) => sum + Number(item.amount), 0);
  const assetCustomerProfitTotal = assetProfits.reduce((sum, item) => sum + Number(item.customerAmount), 0);
  const assetProductCount = new Set(assetInvestments.map((item) => item.product.id)).size;
  const activeProductOptions = (productOptionsQuery.data ?? [])
    .filter((item) => item.status === 'ACTIVE')
    .map((item) => ({
      label: `${item.productNo} · ${item.name}`,
      value: item.id,
    }));

  const investmentColumns: ProColumns<CustomerInvestment>[] = [
    { title: '投资编号', dataIndex: 'investmentNo', width: 150 },
    { title: '产品', width: 180, render: (_, r) => r.product.name },
    { title: '投资金额', dataIndex: 'amount', width: 130, render: (_, r) => money(r.amount) },
    { title: '投资日期', dataIndex: 'investedAt', width: 110, render: (_, r) => date(r.investedAt) },
    { title: '签约人编号', dataIndex: 'contractedEmployeeNo', width: 120, render: (_, r) => r.contractedEmployeeNo ?? '-' },
    { title: '录入人编号', dataIndex: 'createdEmployeeNo', width: 120, render: (_, r) => r.createdEmployeeNo ?? '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
  ];

  const commissionColumns: ProColumns<InvestmentCommissionRecord>[] = [
    { title: '投资编号', width: 150, render: (_, r) => r.investment.investmentNo },
    { title: '分配对象', dataIndex: 'receiverType', width: 120, render: (_, r) => INVESTMENT_COMMISSION_RECEIVER_LABELS[r.receiverType] ?? r.receiverType },
    { title: '对象编号', dataIndex: 'receiverNo', width: 140, render: (_, r) => r.receiverNo ?? '-' },
    { title: '投资本金', dataIndex: 'baseAmount', width: 130, render: (_, r) => money(r.baseAmount) },
    { title: '比例', dataIndex: 'ratio', width: 90, render: (_, r) => `${r.ratio}%` },
    { title: '佣金金额', dataIndex: 'amount', width: 130, render: (_, r) => money(r.amount) },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
  ];

  const shareColumns: ProColumns<ProfitShareRecord>[] = [
    { title: '获益者', dataIndex: 'receiverType', width: 120, render: (_, r) => PROFIT_RECEIVER_LABELS[r.receiverType] ?? r.receiverType },
    { title: '对象编号', dataIndex: 'receiverNo', width: 140, render: (_, r) => r.receiverNo ?? '-' },
    { title: '比例', dataIndex: 'ratio', width: 90, render: (_, r) => `${r.ratio}%` },
    { title: '金额', dataIndex: 'amount', width: 130, render: (_, r) => money(r.amount) },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
  ];

  const profitColumns: ProColumns<CustomerProfitRecord>[] = [
    { title: '产品', width: 180, render: (_, r) => r.product.name },
    { title: '周期', width: 190, render: (_, r) => `${date(r.yieldPeriod.periodStart)} 至 ${date(r.yieldPeriod.periodEnd)}` },
    { title: '投资本金', dataIndex: 'principalAmount', width: 130, render: (_, r) => money(r.principalAmount) },
    { title: '投资占比', dataIndex: 'investmentShareRatio', width: 100, render: (_, r) => `${(Number(r.investmentShareRatio) * 100).toFixed(4)}%` },
    { title: '客户毛收益', dataIndex: 'profitAmount', width: 130, render: (_, r) => money(r.profitAmount) },
    { title: '客户到账', dataIndex: 'customerAmount', width: 130, render: (_, r) => money(r.customerAmount) },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => statusTag(r.status) },
  ];

  const columns: ProColumns<CustomerRow>[] = [
    { title: '客户名称', dataIndex: 'name', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    {
      title: '类型', dataIndex: 'customerType', width: 80,
      valueType: 'select',
      valueEnum: {
        INDIVIDUAL: { text: '个人' },
        COMPANY: { text: '企业' },
      },
      render: (_, r) => <Tag color={r.customerType === 'COMPANY' ? 'blue' : 'default'}>{r.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Tag>,
    },
    { title: '来源', dataIndex: 'source', width: 100, search: false, render: (_, r) => SOURCE_OPTS.find(s => s.value === r.source)?.label ?? r.source },
    { title: '部门', dataIndex: ['department', 'name'], width: 120, search: false },
    { title: '维护人', dataIndex: ['assignedUser', 'name'], width: 100, search: false },
    {
      title: '状态', dataIndex: 'status', width: 80,
      search: false,
      render: (_, r) => statusTag(r.status),
    },
    {
      title: '操作', width: 180, search: false, fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" icon={<FundProjectionScreenOutlined />} onClick={() => setAssetCustomer(row)}>资产</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>编辑</Button>
          <Popconfirm
            title={row.status === CustomerStatus.INACTIVE ? '确认恢复客户？' : '确认停用？'}
            onConfirm={() => toggleMut.mutate({
              id: row.id,
              currentStatus: row.status,
            })}
          >
            <Button size="small" danger={row.status !== CustomerStatus.INACTIVE}
              icon={row.status === CustomerStatus.INACTIVE ? <CheckCircleOutlined /> : <StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Tabs
        activeKey={customerStatusTab}
        onChange={(key) => setCustomerStatusTab(key as typeof customerStatusTab)}
        items={[
          { key: 'ALL', label: '全部客户' },
          { key: CustomerStatus.PROSPECT, label: '意向客户' },
          { key: CustomerStatus.ACTIVE_MEMBER, label: '正式会员' },
          { key: CustomerStatus.INACTIVE, label: '停用客户' },
        ]}
      />
      <ProTable<CustomerRow>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        headerTitle="客户管理"
        params={{ customerStatusTab }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增客户</Button>,
        ]}
        request={async (params) => {
          const status = customerStatusTab === 'ALL' ? undefined : customerStatusTab;
          const res = await customersApi.getAll({
            name: params.name, phone: params.phone, customerType: params.customerType, status,
            page: params.current, pageSize: params.pageSize,
          });
          return { data: res.data as CustomerRow[], total: res.total, success: true };
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
              <Select
                options={userOpts}
                loading={ownerOptionsLoading}
                showSearch
                filterOption={false}
                onSearch={setOwnerKeyword}
                placeholder="搜索姓名或手机号"
                notFoundContent={ownerOptionsLoading ? '归属人加载中...' : '暂无可分配的归属人'}
              />
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Drawer
        title={assetCustomer ? `客户资产 · ${assetCustomer.name}` : '客户资产'}
        open={!!assetCustomer}
        width={1040}
        onClose={() => setAssetCustomer(null)}
      >
        {assetCustomer && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions size="small" column={3} bordered>
              <Descriptions.Item label="客户名称">{assetCustomer.name}</Descriptions.Item>
              <Descriptions.Item label="手机号">{assetCustomer.phone}</Descriptions.Item>
              <Descriptions.Item label="客户状态">{statusTag(assetCustomerDetail.status)}</Descriptions.Item>
              <Descriptions.Item label="客户编号">{assetCustomerDetail.customerNo ?? '首次投资后生成'}</Descriptions.Item>
              <Descriptions.Item label="客户类型">
                {assetCustomer.customerType === 'COMPANY' ? '企业客户' : '个人客户'}
              </Descriptions.Item>
              <Descriptions.Item label="所属部门">{assetCustomer.department?.name ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="维护人">{assetCustomer.assignedUser?.name ?? '-'}</Descriptions.Item>
            </Descriptions>

            {assetCustomerDetail.status !== CustomerStatus.ACTIVE_MEMBER && (
              <Alert
                type="info"
                showIcon
                message="该客户尚未成为正式会员"
                description="在这里新增第一笔投资后，系统会自动把客户激活为正式会员，并生成客户编号和初始密码。"
              />
            )}
            {assetCustomerDetail.status === CustomerStatus.ACTIVE_MEMBER && (
              <Card size="small">
                <Button
                  loading={resetPasswordMut.isPending}
                  onClick={() => resetPasswordMut.mutate()}
                >
                  重置客户登录密码
                </Button>
              </Card>
            )}

            <Card size="small">
              <Space size={32} wrap>
                <Statistic title="投资总额" value={assetInvestmentTotal} prefix="¥" precision={2} />
                <Statistic title="投资产品数" value={assetProductCount} />
                <Statistic title="本金佣金合计" value={assetCommissionTotal} prefix="¥" precision={2} />
                <Statistic title="客户累计到账收益" value={assetCustomerProfitTotal} prefix="¥" precision={2} />
              </Space>
            </Card>

            <ProTable<CustomerInvestment>
              rowKey="id"
              headerTitle="客户投资"
              search={false}
              pagination={false}
              options={false}
              loading={customerAssetsQuery.isFetching}
              columns={investmentColumns}
              dataSource={assetInvestments}
              toolbar={{
                actions: [
                  <Button
                    key="add-investment"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      investmentForm.resetFields();
                      investmentForm.setFieldsValue({ investedAt: dayjs() });
                      setInvestmentDrawerOpen(true);
                    }}
                  >
                    新增投资
                  </Button>,
                ],
              }}
              scroll={{ x: 'max-content' }}
            />

            <ProTable<InvestmentCommissionRecord>
              rowKey="id"
              headerTitle="本金佣金分配"
              search={false}
              pagination={false}
              options={false}
              loading={customerAssetsQuery.isFetching}
              columns={commissionColumns}
              dataSource={assetCommissions}
              scroll={{ x: 'max-content' }}
            />

            <ProTable<CustomerProfitRecord>
              rowKey="id"
              headerTitle="后续收益与分配"
              search={false}
              pagination={false}
              options={false}
              loading={customerAssetsQuery.isFetching}
              columns={profitColumns}
              dataSource={assetProfits}
              expandable={{
                expandedRowRender: (record) => (
                  <ProTable<ProfitShareRecord>
                    rowKey="id"
                    search={false}
                    pagination={false}
                    options={false}
                    columns={shareColumns}
                    dataSource={record.shareRecords ?? []}
                    scroll={{ x: 'max-content' }}
                  />
                ),
              }}
              scroll={{ x: 'max-content' }}
            />
          </Space>
        )}
      </Drawer>

      <Drawer
        title={assetCustomer ? `新增投资 · ${assetCustomer.name}` : '新增投资'}
        open={investmentDrawerOpen}
        width={520}
        onClose={() => setInvestmentDrawerOpen(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setInvestmentDrawerOpen(false)}>取消</Button>
              <Button
                type="primary"
                loading={createInvestmentMut.isPending}
                onClick={() => createInvestmentMut.mutate()}
              >
                保存投资
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={investmentForm} layout="vertical">
          <Form.Item name="productId" label="投资产品" rules={[{ required: true, message: '请选择投资产品' }]}>
            <Select
              showSearch
              loading={productOptionsQuery.isFetching}
              placeholder="选择启用中的产品"
              optionFilterProp="label"
              options={activeProductOptions}
            />
          </Form.Item>
          <Form.Item name="amount" label="投资金额" rules={[{ required: true, message: '请输入投资金额' }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="investedAt" label="投资日期" rules={[{ required: true, message: '请选择投资日期' }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="contractedEmployeeNo"
            label="签约人编号"
            extra="客户未维护签约人时必填；首次投资激活正式会员时会写入客户签约快照。"
          >
            <Input placeholder="如：MKT0201" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
