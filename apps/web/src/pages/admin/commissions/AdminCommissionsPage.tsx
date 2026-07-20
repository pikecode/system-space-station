import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Card, Row, Col, Statistic, App } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionsApi } from '../../../services/commissions';

const PERIOD_STATUS_LABELS: Record<string, string> = { OPEN: '进行中', PENDING_PAYMENT: '待出账', SETTLED: '已结算' };
const PERIOD_STATUS_COLORS: Record<string, string> = { OPEN: 'blue', PENDING_PAYMENT: 'orange', SETTLED: 'green' };

export default function AdminCommissionsPage() {
  const { message, modal } = App.useApp();
  const qc = useQueryClient();

  const { data: periods = [] } = useQuery({
    queryKey: ['periods'],
    queryFn: () => commissionsApi.getPeriods({}),
  });

  const { data: overview } = useQuery({
    queryKey: ['commissions-overview'],
    queryFn: () => commissionsApi.getOverview({ pageSize: '100' }),
  });

  const settleMutation = useMutation({
    mutationFn: (periodId: string) => commissionsApi.settle(periodId),
    onSuccess: () => { message.success('结算成功'); qc.invalidateQueries({ queryKey: ['periods'] }); },
    onError: (e: any) => message.error(e?.response?.data?.message ?? '结算失败'),
  });

  const periodList = Array.isArray(periods) ? periods : [];
  const overviewData = (overview as any)?.data ?? [];

  const totalPending = overviewData.filter((r: any) => r.status === 'PENDING_PAYMENT').reduce((s: number, r: any) => s + Number(r.amount), 0);
  const totalSettled = overviewData.filter((r: any) => r.status === 'SETTLED').reduce((s: number, r: any) => s + Number(r.amount), 0);

  const periodColumns: ProColumns[] = [
    { title: '开始日期', dataIndex: 'startDate', width: 110, render: (_, r) => r.startDate?.slice(0, 10) },
    { title: '结束日期', dataIndex: 'endDate', width: 110, render: (_, r) => r.endDate?.slice(0, 10) },
    { title: '会员费合计', dataIndex: 'totalFee', width: 120, render: (_, r) => `¥${Number(r.totalFee).toLocaleString()}` },
    { title: '分成合计', dataIndex: 'totalAmount', width: 120, render: (_, r) => `¥${Number(r.totalAmount).toLocaleString()}` },
    { title: '明细条数', dataIndex: 'recordCount', width: 90 },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => <Tag color={PERIOD_STATUS_COLORS[r.status]}>{PERIOD_STATUS_LABELS[r.status]}</Tag> },
    { title: '结算人', dataIndex: 'settledBy', width: 90 },
    { title: '结算时间', dataIndex: 'settledAt', width: 150, render: (_, r) => r.settledAt?.slice(0, 16)?.replace('T', ' ') },
    {
      title: '操作', width: 100, fixed: 'right',
      render: (_, r) => r.status === 'PENDING_PAYMENT' ? (
        <Button
          size="small" type="primary"
          onClick={() => modal.confirm({
            title: '确认结算该周期？',
            content: `共 ${r.recordCount} 条分成记录，合计 ¥${Number(r.totalAmount).toLocaleString()}`,
            onOk: () => settleMutation.mutate(r.id),
          })}
        >
          确认结算
        </Button>
      ) : null,
    },
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="待出账" value={totalPending} prefix="¥" precision={2} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已结算" value={totalSettled} prefix="¥" precision={2} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      <ProTable
        rowKey="id"
        columns={periodColumns}
        dataSource={periodList}
        search={false}
        pagination={false}
        headerTitle="结算周期"
        scroll={{ x: 900 }}
      />
    </>
  );
}
