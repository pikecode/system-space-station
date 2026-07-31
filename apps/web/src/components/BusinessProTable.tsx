import { useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProTableProps } from '@ant-design/pro-components';
import { Skeleton, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const SKELETON_ROWS = Array.from({ length: 8 }, (_, i) => ({ _skid: i }));

function buildSkeletonCols(columns: any[]): ColumnsType<{ _skid: number }> {
  return columns
    .filter((c) => c.hideInTable !== true)
    .map((c) => ({
      title: c.title,
      key: String(c.key ?? c.dataIndex ?? c.title ?? Math.random()),
      width: c.width,
      fixed: c.fixed,
      render: () => (
        <Skeleton.Input
          active
          size="small"
          block
          style={{ height: 16, borderRadius: 3 }}
        />
      ),
    }));
}

function BusinessProTable<
  DataType extends Record<string, any>,
  Params extends Record<string, any> = Record<string, any>,
  ValueType = 'text',
>({
  request,
  columns = [],
  ...rest
}: ProTableProps<DataType, Params, ValueType>) {
  const [ready, setReady] = useState(!request);

  const wrappedRequest = request
    ? async (...args: Parameters<NonNullable<typeof request>>) => {
        const result = await request(...args);
        setReady(true);
        return result;
      }
    : undefined;

  return (
    <>
      {/* 首次加载骨架屏：ProTable 隐藏但保持挂载以触发 request */}
      {!ready && (
        <Table<{ _skid: number }>
          rowKey="_skid"
          size="middle"
          columns={buildSkeletonCols(columns as any[])}
          dataSource={SKELETON_ROWS}
          pagination={false}
          style={{ background: '#fff' }}
        />
      )}
      <div style={{ display: ready ? 'block' : 'none' }}>
        <ProTable<DataType, Params, ValueType>
          {...rest}
          columns={columns}
          request={wrappedRequest}
        />
      </div>
    </>
  );
}

export default BusinessProTable;
