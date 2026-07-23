import { useState, useMemo, useRef } from 'react';
import {
  Table, Button, Drawer, Form, Input, Select, Space, Tag, App,
  Cascader, Modal, Tooltip, Segmented, Checkbox,
} from 'antd';
import { TableOutlined, ApartmentOutlined, TeamOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PlusOutlined, EditOutlined, PlusCircleOutlined, StopOutlined, UserOutlined,
  RightOutlined, DownOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { departmentsApi } from '../../../services/departments';
import { usersApi } from '../../../services/users';
import chinaRegions from '../../../utils/chinaRegions';
import DeptMindMap from './DeptMindMap';

const DEPT_TYPE_LABELS: Record<string, string> = {
  GOVERNANCE: '治理层',
  HQ: '总经办',
  CENTER: '中心',
  DIRECT: '直属部门',
  MARKET: '市场部',
  DIVISION: '事业部',
};

const DEPT_TYPE_COLORS: Record<string, string> = {
  GOVERNANCE: 'magenta',
  HQ: 'red',
  CENTER: 'purple',
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

interface MemberRow {
  id: string;
  name: string;
  phone: string;
  employeeNo?: string;
  userType: string;
  hasLicense: boolean;
  shareCode?: string;
  role: string;
  status: string;
  departmentId?: string;
}

const DEPT_CAPACITY: Record<string, number> = { MARKET: 3, DIVISION: 7 };

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

type ViewMode = 'table' | 'chart';

export default function DepartmentsPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const actionRef = useRef<ActionType>();
  const [departments, setDepartments] = useState<DeptNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeptNode | null>(null);
  const [parentContext, setParentContext] = useState<DeptNode | null>(null);
  const [headPickerOpen, setHeadPickerOpen] = useState(false);
  const [headSearch, setHeadSearch] = useState('');
  // 人员管理
  const [memberDept, setMemberDept] = useState<DeptNode | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberForm] = Form.useForm();
  const watchedAddUserType = Form.useWatch('userType', addMemberForm);
  // 选择已有人员
  const [selectUserOpen, setSelectUserOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [form] = Form.useForm();
  const watchedType = Form.useWatch('type', form);

  const { data: deptUsers = [], isLoading: usersLoading } = useQuery<UserItem[]>({
    queryKey: ['dept-users', editTarget?.id],
    queryFn: () =>
      usersApi.getAll({ departmentId: editTarget?.id, status: 'ACTIVE' }) as unknown as Promise<UserItem[]>,
    enabled: !!editTarget?.id && headPickerOpen,
  });

  // 当前部门人员列表
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery<MemberRow[]>({
    queryKey: ['dept-members', memberDept?.id],
    queryFn: () => usersApi.getAll({ departmentId: memberDept?.id }) as unknown as Promise<MemberRow[]>,
    enabled: !!memberDept?.id,
  });

  // 全部用户（用于人数统计 + 选择已有人员）
  const { data: allUsers = [], refetch: refetchAllUsers } = useQuery<MemberRow[]>({
    queryKey: ['all-users-for-assign'],
    queryFn: () => usersApi.getAll({ status: 'ACTIVE' }) as unknown as Promise<MemberRow[]>,
  });

  const memberCountMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    allUsers.forEach((u) => {
      if (u.departmentId) map[u.departmentId] = (map[u.departmentId] ?? 0) + 1;
    });
    return map;
  }, [allUsers]);

  const addMemberMutation = useMutation({
    mutationFn: (data: unknown) => usersApi.create(data),
    onSuccess: () => {
      message.success('人员已添加');
      setAddMemberOpen(false);
      addMemberForm.resetFields();
      refetchMembers();
      refetchAllUsers();
      queryClient.invalidateQueries({ queryKey: ['dept-members'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '添加失败');
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({ userId, deptId }: { userId: string; deptId: string }) =>
      usersApi.transfer(userId, { newDepartmentId: deptId, newRole: 'MEMBER' }),
    onSuccess: () => {
      message.success('人员已加入该部门');
      setSelectUserOpen(false);
      setUserSearch('');
      refetchMembers();
      refetchAllUsers();
      queryClient.invalidateQueries({ queryKey: ['dept-members'] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: unknown) =>
      editTarget
        ? departmentsApi.update(editTarget.id, formData)
        : departmentsApi.create(formData),
    onSuccess: () => {
      message.success(editTarget ? '更新成功' : '创建成功');
      actionRef.current?.reload();
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
      actionRef.current?.reload();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '停用失败');
    },
  });

  const VALID_PARENT_TYPE: Record<string, string[]> = {
    GOVERNANCE: ['GOVERNANCE'],
    HQ: ['GOVERNANCE'],
    CENTER: ['HQ'],
    DIRECT: ['HQ', 'CENTER'],
    MARKET: ['CENTER'],
    DIVISION: ['MARKET'],
  };

  const ALLOWED_CHILD_TYPES: Record<string, string[]> = {
    GOVERNANCE: ['GOVERNANCE', 'HQ'],
    HQ: ['CENTER', 'DIRECT'],
    CENTER: ['DIRECT', 'MARKET'],
    MARKET: ['DIVISION'],
    DIRECT: [],
    DIVISION: [],
  };

  const hqExists = departments.some((d) => d.type === 'HQ');
  const isEditingHQ = editTarget?.type === 'HQ';
  const needsParent = watchedType && watchedType !== 'HQ' && watchedType !== 'GOVERNANCE';

  const parentOptions = useMemo(() => {
    if (!watchedType || watchedType === 'HQ' || watchedType === 'GOVERNANCE') return [];
    const validTypes = VALID_PARENT_TYPE[watchedType] ?? [];
    return departments
      .filter((d) => validTypes.includes(d.type) && d.id !== editTarget?.id)
      .map((d) => ({ value: d.id, label: `${d.name}（${DEPT_TYPE_LABELS[d.type]}）` }));
  }, [watchedType, departments, editTarget]);

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

  const columns: ProColumns<DeptNode>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (_, record) => {
        const isMarketCenter = record.name === '营销中心';
        const isMarket = record.type === 'MARKET';
        const isDivision = record.type === 'DIVISION';
        return (
          <Space size={6}>
            {isMarketCenter && (
              <span style={{
                display: 'inline-block', width: 3, height: 14,
                background: '#52c41a', borderRadius: 2, verticalAlign: 'middle',
              }} />
            )}
            {isMarket && (
              <span style={{
                display: 'inline-block', width: 6, height: 6,
                background: '#52c41a', borderRadius: '50%', verticalAlign: 'middle',
              }} />
            )}
            {isDivision && (
              <span style={{
                display: 'inline-block', width: 6, height: 6,
                background: '#fa8c16', borderRadius: '50%', verticalAlign: 'middle',
              }} />
            )}
            <span style={{
              fontWeight: isMarketCenter || isMarket ? 600 : 400,
              color: isMarketCenter ? '#237804' : isMarket ? '#389e0d' : isDivision ? '#ad4e00' : '#1d2129',
            }}>
              {record.name}
            </span>
          </Space>
        );
      },
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
      render: (_, record) => (
        <Tag color={DEPT_TYPE_COLORS[record.type]}>{DEPT_TYPE_LABELS[record.type]}</Tag>
      ),
    },
    {
      title: '人数',
      key: 'memberCount',
      width: 90,
      render: (_, record) => {
        const count = memberCountMap[record.id] ?? 0;
        const cap = DEPT_CAPACITY[record.type];
        return (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => setMemberDept(record)}
          >
            {cap ? (
              <span style={{ color: count >= cap ? '#f5222d' : count > 0 ? '#1677ff' : '#86909c' }}>
                {count}/{cap}人
              </span>
            ) : count > 0 ? (
              <span style={{ color: '#1677ff' }}>{count}人</span>
            ) : (
              <span style={{ color: '#86909c' }}>暂无</span>
            )}
          </Button>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'head',
      key: 'head',
      width: 100,
      render: (_, record) => record.head?.name || '-',
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
      width: 180,
      ellipsis: true,
      render: (desc) => desc || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => {
        const canAddChild = record.type === 'MARKET'; // 只有市场部可以创建事业部
        return (
          <Space size={4}>
            <Tooltip title="人员管理" getPopupContainer={() => document.body}>
              <Button size="small" icon={<TeamOutlined />} onClick={() => setMemberDept(record)} />
            </Tooltip>
            <Tooltip title="编辑部门" getPopupContainer={() => document.body}>
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
            {canAddChild && (
              <Tooltip title="添加事业部" getPopupContainer={() => document.body}>
                <Button size="small" icon={<PlusCircleOutlined />} onClick={() => openCreate(record)} />
              </Tooltip>
            )}
            <Tooltip title="停用部门" getPopupContainer={() => document.body}>
              <Button size="small" danger icon={<StopOutlined />} onClick={() => confirmDisable(record)} />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<DeptNode>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const response = await departmentsApi.getAll() as unknown as DeptNode[];
          const list = Array.isArray(response) ? response : [];
          setDepartments(list);
          setExpandedKeys(list.map((d) => d.id));
          return { data: buildTreeData(list), success: true, total: list.length };
        }}
        search={false}
        pagination={false}
        headerTitle="部门管理"
        toolbar={{
          actions: [
            <Segmented
              key="view"
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
              options={[
                { value: 'table', icon: <TableOutlined /> },
                { value: 'chart', icon: <ApartmentOutlined /> },
              ]}
              style={{ marginRight: 8 }}
            />,
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
              新建部门
            </Button>,
          ],
        }}
        tableRender={viewMode === 'chart' ? () => (
          <div style={{ position: 'relative', height: 'calc(100vh - 220px)', minHeight: 500 }}>
            <Button
              size="small"
              icon={<TableOutlined />}
              onClick={() => setViewMode('table')}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
              }}
            >
              返回列表
            </Button>
            <DeptMindMap roots={buildTreeData(departments)} />
          </div>
        ) : undefined}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
          style: {
            background:
              record.name === '营销中心' ? '#f6ffed' :
              record.type === 'MARKET'   ? '#f6ffed' :
              record.type === 'DIVISION' ? '#fff9f0' : undefined,
          },
        })}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys(keys as string[]),
          indentSize: 20,
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!record.children || record.children.length === 0) {
              return <span style={{ display: 'inline-block', width: 20, marginRight: 4 }} />;
            }
            return (
              <Button
                type="text"
                size="small"
                icon={expanded
                  ? <DownOutlined style={{ fontSize: 10, color: '#86909c' }} />
                  : <RightOutlined style={{ fontSize: 10, color: '#86909c' }} />}
                onClick={(e) => onExpand(record, e)}
                style={{ padding: 0, width: 20, height: 20, marginRight: 4, verticalAlign: 'middle' }}
              />
            );
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
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>
              保存
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {editTarget ? (
            <Form.Item label="部门名称">
              <Input readOnly value={editTarget.name} style={{ background: '#fafafa', color: '#666' }} />
            </Form.Item>
          ) : (
            <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
              <Input />
            </Form.Item>
          )}
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
          {!editTarget && parentContext ? (
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
          ) : !editTarget && needsParent ? (
            <Form.Item
              name="parentId"
              label="上级部门"
              rules={[{ required: true, message: '请选择上级部门' }]}
              extra={
                watchedType === 'DIVISION' ? '事业部的上级必须是市场部' :
                watchedType === 'MARKET' ? '市场部的上级必须是中心（如营销中心）' :
                watchedType === 'CENTER' ? '中心的上级必须是总经办' :
                watchedType === 'HQ' ? '总经办的上级必须是治理层（如董事会）' :
                '直属部门的上级可以是总经办或各中心'
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

      {/* ── 人员管理 Drawer ─────────────────────────────── */}
      <Drawer
        title={
          <Space>
            <TeamOutlined />
            {memberDept?.name}的成员
            {memberDept && DEPT_CAPACITY[memberDept.type] && (
              <Tag color={members.length >= DEPT_CAPACITY[memberDept.type]! ? 'red' : 'blue'}>
                {members.length}/{DEPT_CAPACITY[memberDept.type]}人
              </Tag>
            )}
          </Space>
        }
        open={!!memberDept}
        onClose={() => setMemberDept(null)}
        width={560}
        footer={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                addMemberForm.resetFields();
                addMemberForm.setFieldsValue({
                  departmentId: memberDept?.id,
                  userType: memberDept?.type === 'DIVISION' ? 'PARTNER' : 'EMPLOYEE',
                  role: 'MEMBER',
                });
                setAddMemberOpen(true);
              }}
            >
              新增人员
            </Button>
            <Button icon={<UserOutlined />} onClick={() => setSelectUserOpen(true)}>
              选择已有人员
            </Button>
          </Space>
        }
      >
        <Table<MemberRow>
          dataSource={members}
          loading={membersLoading}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: '姓名', dataIndex: 'name', width: 90 },
            { title: '手机号', dataIndex: 'phone', width: 120 },
            {
              title: '类型',
              dataIndex: 'userType',
              width: 80,
              render: (t) => <Tag color={t === 'PARTNER' ? 'orange' : 'default'}>{t === 'PARTNER' ? '合伙人' : '员工'}</Tag>,
            },
            {
              title: '资格证',
              dataIndex: 'hasLicense',
              width: 70,
              render: (v) => v ? <Tag color="gold">持证</Tag> : '-',
            },
            {
              title: '分享码',
              dataIndex: 'shareCode',
              width: 90,
              render: (v) => v ? <span style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{v}</span> : '-',
            },
            {
              title: '角色',
              dataIndex: 'role',
              width: 80,
              render: (r) => <Tag color={r === 'HEAD' ? 'blue' : 'default'}>{r === 'HEAD' ? '负责人' : '成员'}</Tag>,
            },
            {
              title: '操作',
              width: 80,
              render: (_, member) => (
                <Tooltip title="移出部门">
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      modal.confirm({
                        title: `将「${member.name}」移出该部门？`,
                        content: '移出后该人员仍保留账号，可重新分配到其他部门。',
                        okText: '确认移出',
                        okType: 'danger',
                        onOk: () => usersApi.removeFromDepartment(member.id)
                          .then(() => { message.success('已移出'); refetchMembers(); refetchAllUsers(); })
                          .catch((e: any) => message.error(e?.response?.data?.message ?? '操作失败')),
                      });
                    }}
                  >
                    移出
                  </Button>
                </Tooltip>
              ),
            },
          ] as ColumnsType<MemberRow>}
          locale={{ emptyText: '该部门暂无成员' }}
        />
      </Drawer>

      {/* ── 新增人员表单 ────────────────────────────────── */}
      <Modal
        title={`向「${memberDept?.name}」新增人员`}
        open={addMemberOpen}
        onCancel={() => setAddMemberOpen(false)}
        onOk={() => addMemberForm.submit()}
        confirmLoading={addMemberMutation.isPending}
        width={480}
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          onFinish={(values) => {
            const isPartner = values.userType === 'PARTNER';
            addMemberMutation.mutate({
              ...values,
              password: isPartner ? undefined : values.phone,
            });
          }}
        >
          <Form.Item name="userType" label="人员类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'EMPLOYEE', label: '员工（公司正式）' },
              { value: 'PARTNER', label: '合伙人（事业部）' },
            ]} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="phone" label="手机号"
            rules={[{ required: true }, { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }]}>
            <Input maxLength={11} />
          </Form.Item>
          {watchedAddUserType !== 'PARTNER' && (
            <Form.Item name="employeeNo" label="工号" rules={[{ required: true, message: '请输入工号' }]}>
              <Input maxLength={32} />
            </Form.Item>
          )}
          {(memberDept?.type === 'MARKET' || memberDept?.type === 'DIVISION') && (
            <Form.Item name="hasLicense" valuePropName="checked" label=" ">
              <Checkbox>持有资格证（负责人必须持证）</Checkbox>
            </Form.Item>
          )}
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[
              { value: 'HEAD', label: '部门负责人' },
              { value: 'MEMBER', label: '普通成员' },
            ]} />
          </Form.Item>
          <Form.Item name="departmentId" hidden><Input /></Form.Item>
        </Form>
      </Modal>

      {/* ── 选择已有人员 ────────────────────────────────── */}
      <Modal
        title={`选择人员加入「${memberDept?.name}」`}
        open={selectUserOpen}
        onCancel={() => { setSelectUserOpen(false); setUserSearch(''); }}
        footer={null}
        width={520}
      >
        <Input.Search
          placeholder="搜索姓名或手机号"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          allowClear
        />
        <Table<MemberRow>
          dataSource={allUsers.filter(
            (u) => u.departmentId !== memberDept?.id &&
              (u.name.includes(userSearch) || u.phone.includes(userSearch)),
          )}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ y: 280 }}
          columns={[
            { title: '姓名', dataIndex: 'name', width: 90 },
            { title: '手机号', dataIndex: 'phone', width: 120 },
            {
              title: '类型',
              dataIndex: 'userType',
              width: 70,
              render: (t) => <Tag color={t === 'PARTNER' ? 'orange' : 'default'}>{t === 'PARTNER' ? '合伙人' : '员工'}</Tag>,
            },
            {
              title: '操作', width: 70,
              render: (_, u) => (
                <Button
                  type="link" size="small"
                  loading={transferMutation.isPending}
                  onClick={() => transferMutation.mutate({ userId: u.id, deptId: memberDept!.id })}
                >
                  加入
                </Button>
              ),
            },
          ] as ColumnsType<MemberRow>}
          locale={{ emptyText: '无可选人员' }}
        />
      </Modal>
    </>
  );
}
