import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag, Statistic, Row, Col, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { commissionsApi } from '../../../services/commissions';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待结算',
  PENDING_PAYMENT: '待出账',
  SETTLED: '已结算',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'orange',
  PENDING_PAYMENT: 'blue',
  SETTLED: 'green',
};

const RECEIVER_ROLE_LABELS: Record<string, string> = {
  MEMBER: '维护人',
  DEPT_HEAD: '部门负责人',
  MARKET_HEAD: '市场负责人',
  COMPANY: '公司',
};

interface CommissionRecord {
  id: string;
  status: string;
  amount: string | number;
  ratio: number;
  receiverRole: string;
  createdAt: string;
  membership?: {
    fee: string | number;
    customer?: { name: string };
  };
}

export default function CommissionsPage({ scope = 'my' }: { scope?: 'my' | 'department' }) {
  const { data } = useQuery({
    queryKey: [`${scope}-commissions`],
    queryFn: () =>
      scope === 'department'
        ? commissionsApi.getDepartment({ pageSize: 100 })
        : commissionsApi.getMy({ pageSize: 100 }),
  });

  const list: CommissionRecord[] =
    (data as { data?: CommissionRecord[] } | undefined)?.data ?? [];

  const totalPending = list
    .filter((r) => r.status === 'PENDING')
    .reduce((s, r) => s + Number(r.amount), 0);

  const totalSettled = list
    .filter((r) => r.status === 'SETTLED')
    .reduce((s, r) => s + Number(r.amount), 0);

  const columns: ProColumns<CommissionRecord>[] = [
    {
      title: '客户',
      dataIndex: ['membership', 'customer', 'name'],
      width: 100,
      fixed: 'left',
    },
    {
      title: '分成金额',
      dataIndex: 'amount',
      width: 100,
      render: (_, r) => (
        <span style={{ color: Number(r.amount) < 0 ? 'red' : 'inherit' }}>
          ¥{Number(r.amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => (
        <Tag color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Tag>
      ),
    },
    {
      title: '会员费',
      dataIndex: ['membership', 'fee'],
      width: 100,
      responsive: ['md'],
      render: (_, r) => `¥${Number(r.membership?.fee).toLocaleString()}`,
    },
    {
      title: '分成角色',
      dataIndex: 'receiverRole',
      width: 100,
      responsive: ['md'],
      render: (_, r) => RECEIVER_ROLE_LABELS[r.receiverRole] ?? r.receiverRole,
    },
    {
      title: '比例',
      dataIndex: 'ratio',
      width: 70,
      responsive: ['lg'],
      render: (_, r) => `${r.ratio}%`,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 150,
      responsive: ['md'],
      render: (_, r) => r.createdAt?.slice(0, 16).replace('T', ' '),
    },
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="待结算"
              value={totalPending}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已结算"
              value={totalSettled}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      <ProTable<CommissionRecord>
        rowKey="id"
        columns={columns}
        dataSource={list}
        headerTitle={scope === 'department' ? '部门分成明细' : '个人分成明细'}
        search={false}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}
