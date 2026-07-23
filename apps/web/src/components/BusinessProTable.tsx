import { SettingOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProTableProps } from '@ant-design/pro-components';
import { Button } from 'antd';

function BusinessProTable<
  DataType extends Record<string, any>,
  Params extends Record<string, any> = Record<string, any>,
  ValueType = 'text',
>(props: ProTableProps<DataType, Params, ValueType>) {
  const { options, ...tableProps } = props;
  const setting = options && options.setting;
  const settingOptions = typeof setting === 'object' ? setting : undefined;

  return (
    <ProTable<DataType, Params, ValueType>
      {...tableProps}
      options={options === false ? false : {
        ...options,
        setting: setting === false ? false : {
          ...settingOptions,
          settingIcon: (
            <Button
              type="text"
              aria-label="列设置"
              icon={settingOptions?.settingIcon ?? <SettingOutlined />}
              style={{ width: 32, height: 32, padding: 0 }}
            />
          ),
        },
      }}
    />
  );
}

export default BusinessProTable;
