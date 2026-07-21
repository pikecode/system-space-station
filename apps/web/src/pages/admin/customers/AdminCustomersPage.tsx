import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { customersApi } from '../../../services/customers';

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL: '转介绍',
  SELF_DEVELOPED: '自主开发',
  ACTIVITY: '活动',
  ONLINE: '线上',
  OTHER: '其他',
};

export default function AdminCustomersPage() {
  const columns: ProColumns[] = [
    { title: '客户名称', dataIndex: 'name', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    {
      title: '类型',
      dataIndex: 'customerType',
      width: 80,
      render: (_, row) => <Tag>{row.customerType === 'INDIVIDUAL' ? '个人' : '企业'}</Tag>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      width: 100,
      render: (_, row) => SOURCE_LABELS[row.source] ?? row.source,
    },
    { title: '所属部门', dataIndex: ['department', 'name'], width: 120, search: false },
    { title: '维护人', dataIndex: ['assignedUser', 'name'], width: 100, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        ACTIVE: { text: '正常', status: 'Success' },
        INACTIVE: { text: '停用', status: 'Default' },
      },
    },
  ];

  return (
    <ProTable
      rowKey="id"
      columns={columns}
      headerTitle="全公司客户（只读）"
      request={async (params) => {
        const response = (await customersApi.getAll({
          name: params.name,
          phone: params.phone,
          status: params.status,
          page: params.current,
          pageSize: params.pageSize,
        })) as { data?: unknown[]; total?: number };
        return { data: response.data ?? [], total: response.total ?? 0, success: true };
      }}
      scroll={{ x: 800 }}
    />
  );
}
