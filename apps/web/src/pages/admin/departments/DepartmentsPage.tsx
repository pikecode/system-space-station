import { useState, useMemo } from 'react';
import {
  Table, Card, Button, Drawer, Form, Input, Select, Space, Tag, App,
  Dropdown, Cascader, Modal,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined, EditOutlined, PlusCircleOutlined, StopOutlined,
  MoreOutlined, UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { departmentsApi } from '../../../services/departments';
import { usersApi } from '../../../services/users';
import chinaRegions from '../../../utils/chinaRegions';

const DEPT_TYPE_LABELS: Record<string, string> = {
  HQ: '总部',
  DIRECT: '直属部门',
  MARKET: '市场部',
  DIVISION: '事业部',
};

const DEPT_TYPE_COLORS: Record<string, string> = {
  HQ: 'red',
  DIRECT: 'blue',
  MARKET: 'green',
  DIVISION: 'orange',
};

interface DeptNode {
  id: string;
  name: string;
  code?: string;
  type: string;
  parentId?: string;
  headId?: string;
  head?: { id: string; name: string };
  province?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  description?: string;
  key: string;
  title: string;
  children: DeptNode[];
}

interface UserItem {
  id: string;
  name: string;
  phone: string;
  role: string;
}

function buildTreeData(list: DeptNode[]): DeptNode[] {
  const map: Record<string, DeptNode> = {};
  list.forEach((d) => {
    map[d.id] = { ...d, key: d.id, title: d.name, children: [] };
  });
  const roots: DeptNode[] = [];
  list.forEach((d) => {
    if (d.parentId && map[d.parentId]) {
      map[d.parentId].children.push(map[d.id]);
    } else {
      roots.push(map[d.id]);
    }
  });
  return roots;
}

export default function DepartmentsPage() {
  const { message, modal } = App.useApp();
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeptNode | null>(null);
  const [parentContext, setParentContext] = useState<DeptNode | null>(null);
  const [headPickerOpen, setHeadPickerOpen] = useState(false);
  const [headSearch, setHeadSearch] = useState('');
  const [form] = Form.useForm();
  const watchedType = Form.useWatch('type', form);

  const { data = [], isLoading } = useQuery<DeptNode[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll() as unknown as Promise<DeptNode[]>,
  });

  const { data: deptUsers = [], isLoading: usersLoading } = useQuery<UserItem[]>({
    queryKey: ['dept-users', editTarget?.id],
    queryFn: () =>
      usersApi.getAll({ departmentId: editTarget?.id, status: 'ACTIVE' }) as unknown as Promise<UserItem[]>,
    enabled: !!editTarget?.id && headPickerOpen,
  });

  const createMutation = useMutation({
    mutationFn: (formData: unknown) =>
      editTarget
        ? departmentsApi.update(editTarget.id, formData)
        : departmentsApi.create(formData),
    onSuccess: () => {
      message.success(editTarget ? '更新成功' : '创建成功');
      qc.invalidateQueries({ queryKey: ['departments'] });
      setDrawerOpen(false);
      form.resetFields();
      setEditTarget(null);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.disable(id),
    onSuccess: () => {
      message.success('已停用');
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '停用失败');
    },
  });

  const treeData = buildTreeData(data);

  const VALID_PARENT_TYPE: Record<string, string> = {
    DIRECT: 'HQ',
    MARKET: 'HQ',
    DIVISION: 'MARKET',
  };

  const ALLOWED_CHILD_TYPES: Record<string, string[]> = {
    HQ: ['DIRECT', 'MARKET'],
    MARKET: ['DIVISION'],
    DIRECT: [],
    DIVISION: [],
  };

  const hqExists = data.some((d) => d.type === 'HQ');
  const isEditingHQ = editTarget?.type === 'HQ';
  const needsParent = watchedType && watchedType !== 'HQ';

  const parentOptions = useMemo(() => {
    if (!watchedType || watchedType === 'HQ') return [];
    const validType = VALID_PARENT_TYPE[watchedType];
    return data
      .filter((d) => d.type === validType && d.id !== editTarget?.id)
      .map((d) => ({ value: d.id, label: d.name }));
  }, [watchedType, data, editTarget]);

  const typeOptions = useMemo(() => {
    const baseOptions = Object.entries(DEPT_TYPE_LABELS).map(([v, l]) => ({
      value: v,
      label: l,
      disabled: v === 'HQ' && hqExists && !isEditingHQ,
    }));

    if (parentContext) {
      const allowedTypes = ALLOWED_CHILD_TYPES[parentContext.type] || [];
      return baseOptions.filter((opt) => allowedTypes.includes(opt.value));
    }

    return baseOptions;
  }, [hqExists, isEditingHQ, parentContext]);

  const filteredUsers = deptUsers.filter((u) =>
    u.name.includes(headSearch) || u.phone.includes(headSearch),
  );

  const openCreate = (parent?: DeptNode) => {
    setEditTarget(null);
    setParentContext(parent ?? null);
    form.resetFields();
    if (parent) {
      form.setFieldValue('parentId', parent.id);
      const allowedTypes = ALLOWED_CHILD_TYPES[parent.type] ?? [];
      if (allowedTypes.length === 1) form.setFieldValue('type', allowedTypes[0]);
    }
    setDrawerOpen(true);
  };

  const openEdit = (dept: DeptNode) => {
    setEditTarget(dept);
    const addressValue = [dept.province, dept.city, dept.district].filter(Boolean);
    form.setFieldsValue({
      ...dept,
      address: addressValue.length === 3 ? addressValue : undefined,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const { address, ...rest } = values;
    const [province, city, district] = (address as string[]) ?? [];
    createMutation.mutate({ ...rest, province, city, district });
  };

  const confirmDisable = (record: DeptNode) => {
    modal.confirm({
      title: `停用「${record.name}」`,
      content: '停用后该部门将不可使用，且无法恢复（除非重新创建）。确认停用吗？',
      okText: '确认停用',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => disableMutation.mutate(record.id),
    });
  };

  const headPickerColumns: ColumnsType<UserItem> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, user) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            form.setFieldsValue({ headId: user.id, headName: user.name });
            setHeadPickerOpen(false);
            setHeadSearch('');
          }}
        >
          选择
        </Button>
      ),
    },
  ];

  const columns: ColumnsType<DeptNode> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      fixed: 'left',
    },
    {
      title: '部门短码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => code || '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={DEPT_TYPE_COLORS[type]}>{DEPT_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'head',
      key: 'head',
      width: 100,
      render: (head) => head?.name || '-',
    },
    {
      title: '地址',
      key: 'address',
      width: 200,
      render: (_, record) => {
        const parts = [record.province, record.city, record.district].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : '-';
      },
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => desc || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const canAddChild = ALLOWED_CHILD_TYPES[record.type]?.length > 0;
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => openEdit(record),
          },
          ...(canAddChild
            ? [{
                key: 'add-child',
                icon: <PlusCircleOutlined />,
                label: '添加子部门',
                onClick: () => openCreate(record),
              }]
            : []),
          { type: 'divider' as const },
          {
            key: 'disable',
            icon: <StopOutlined />,
            label: '停用',
            danger: true,
            onClick: () => confirmDisable(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="部门管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
            新建部门
          </Button>
        }
      >
        <Table<DeptNode>
          columns={columns}
          dataSource={treeData}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1200 }}
          expandable={{
            defaultExpandAllRows: true,
            indentSize: 24,
            expandIcon: ({ expanded, onExpand, record }) => {
              if (!record.children || record.children.length === 0) {
                return <span style={{ marginRight: 8, display: 'inline-block', width: 16 }} />;
              }
              return (
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => onExpand(record, e)}
                  style={{ padding: 0, width: 16, height: 16, fontSize: 12 }}
                >
                  {expanded ? '−' : '+'}
                </Button>
              );
            },
          }}
        />
      </Card>

      {/* 负责人选择弹窗 */}
      <Modal
        title="选择负责人"
        open={headPickerOpen}
        onCancel={() => { setHeadPickerOpen(false); setHeadSearch(''); }}
        footer={null}
        width={520}
      >
        <Input.Search
          placeholder="搜索姓名或手机号"
          value={headSearch}
          onChange={(e) => setHeadSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          allowClear
        />
        <Table<UserItem>
          columns={headPickerColumns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={usersLoading}
          size="small"
          pagination={false}
          scroll={{ y: 360 }}
          locale={{ emptyText: '该部门暂无员工' }}
        />
      </Modal>

      <Drawer
        title={
          editTarget
            ? `编辑部门 · ${editTarget.name}`
            : parentContext
              ? `为「${parentContext.name}」添加子部门`
              : '新建部门'
        }
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditTarget(null);
          setParentContext(null);
          form.resetFields();
        }}
        width={480}
        footer={
          <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>
            保存
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="部门短码">
            <Input placeholder="例如 MARKET-01" maxLength={30} />
          </Form.Item>
          <Form.Item
            name="type"
            label="部门类型"
            rules={[{ required: true, message: '请选择部门类型' }]}
            extra={isEditingHQ ? '总部类型创建后不可变更' : undefined}
          >
            <Select
              options={typeOptions}
              disabled={isEditingHQ || (parentContext !== null && typeOptions.length === 1)}
              onChange={() => form.setFieldValue('parentId', undefined)}
            />
          </Form.Item>
          {parentContext ? (
            <Form.Item label="上级部门">
              <Input
                readOnly
                value={`${parentContext.name}（${DEPT_TYPE_LABELS[parentContext.type]}）`}
                style={{ background: '#fafafa', color: '#666' }}
              />
              <Form.Item name="parentId" noStyle>
                <Input type="hidden" />
              </Form.Item>
            </Form.Item>
          ) : needsParent ? (
            <Form.Item
              name="parentId"
              label="上级部门"
              rules={[{ required: true, message: '请选择上级部门' }]}
              extra={
                watchedType === 'DIVISION' ? '事业部的上级必须是市场部' : '直属部门和市场部的上级必须是总部'
              }
            >
              <Select
                placeholder="请选择上级部门"
                options={parentOptions}
                notFoundContent={parentOptions.length === 0 ? '无可用上级部门' : undefined}
              />
            </Form.Item>
          ) : null}
          {editTarget && (
            <Form.Item label="负责人">
              <Space>
                <Form.Item name="headName" noStyle>
                  <Input
                    readOnly
                    placeholder="未设置"
                    prefix={<UserOutlined />}
                    style={{ width: 200 }}
                  />
                </Form.Item>
                <Form.Item name="headId" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <Button onClick={() => setHeadPickerOpen(true)}>选择</Button>
                <Button onClick={() => form.setFieldsValue({ headId: null, headName: '' })}>
                  清除
                </Button>
              </Space>
            </Form.Item>
          )}
          <Form.Item name="description" label="部门说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="address" label="省市区">
            <Cascader
              options={chinaRegions}
              placeholder="请选择省/市/区"
              showSearch
              expandTrigger="hover"
            />
          </Form.Item>
          <Form.Item name="addressDetail" label="详细地址">
            <Input placeholder="街道/楼栋/门牌号" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
