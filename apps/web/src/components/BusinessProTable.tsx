import { ProTable } from '@ant-design/pro-components';
import type { ProTableProps } from '@ant-design/pro-components';

function BusinessProTable<
  DataType extends Record<string, any>,
  Params extends Record<string, any> = Record<string, any>,
  ValueType = 'text',
>(props: ProTableProps<DataType, Params, ValueType>) {
  return (
    <ProTable<DataType, Params, ValueType>
      {...props}
    />
  );
}

export default BusinessProTable;
