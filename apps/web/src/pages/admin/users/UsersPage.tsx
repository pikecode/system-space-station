import { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  Cascader,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  TreeSelect,
} from 'antd';
import chinaRegions from '../../../utils/chinaRegions';
import dayjs from 'dayjs';
import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../services/users';
import { departmentsApi } from '../../../services/departments';
import { positionsApi } from '../../../services/positions';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  HEAD: '部门负责人',
  MEMBER: '部门成员',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'red',
  HEAD: 'blue',
  MEMBER: 'default',
};

interface UserRow {
  id: string;
  name: string;
  phone: string;
  employeeNo?: string;
  gender?: string;
  birthDate?: string;
  alternatePhone?: string;
  wechat?: string;
  province?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  idCardMasked?: string;
  email?: string;
  positionId?: string;
  departmentId?: string;
  role: string;
  status: string;
  department?: { id: string; name: string };
  position?: { id: string; name: string };
  headOf?: { id: string; name: string };
}

interface OptionItem {
  id: string;
  name: string;
  parentId?: string;
}

interface DeptTreeNode {
  title: string;
  value: string;
  children: DeptTreeNode[];
}

function buildDeptTree(list: OptionItem[]): DeptTreeNode[] {
  const map: Record<string, DeptTreeNode> = {};
  list.forEach((d) => { map[d.id] = { title: d.name, value: d.id, children: [] }; });
  const roots: DeptTreeNode[] = [];
  list.forEach((d) => {
    if (d.parentId && map[d.parentId]) {
      map[d.parentId].children.push(map[d.id]);
    } else {
      roots.push(map[d.id]);
    }
  });
  return roots;
}

export default function UsersPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [transferTarget, setTransferTarget] = useState<UserRow | null>(null);
  const [disableTarget, setDisableTarget] = useState<UserRow | null>(null);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [disableForm] = Form.useForm();
  const watchedRole = Form.useWatch('role', form);

  const { data: departments = [] } = useQuery<OptionItem[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll() as unknown as Promise<OptionItem[]>,
  });
  const { data: positions = [] } = useQuery<OptionItem[]>({
    queryKey: ['positions'],
    queryFn: () => positionsApi.getAll() as unknown as Promise<OptionItem[]>,
  });
  const { data: userOptions = [] } = useQuery<UserRow[]>({
    queryKey: ['users-options'],
    queryFn: () => usersApi.getAll() as unknown as Promise<UserRow[]>,
  });

  const refreshUsers = () => {
    actionRef.current?.reload();
    queryClient.invalidateQueries({ queryKey: ['users-options'] });
    queryClient.invalidateQueries({ queryKey: ['departments'] });
  };

  const saveMutation = useMutation({
    mutationFn: (data: unknown) =>
      editTarget ? usersApi.update(editTarget.id, data) : usersApi.create(data),
    onSuccess: () => {
      message.success('保存成功');
      closeDrawer();
      refreshUsers();
    },
    onError: (error: unknown) => message.error(apiError(error, '操作失败')),
  });

  const transferMutation = useMutation({
    mutationFn: (data: unknown) => usersApi.transfer(transferTarget!.id, data),
    onSuccess: () => {
      message.success('调岗成功');
      setTransferTarget(null);
      transferForm.resetFields();
      refreshUsers();
    },
    onError: (error: unknown) => message.error(apiError(error, '调岗失败')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, successorId }: {
      id: string;
      status: string;
      successorId?: string;
    }) => usersApi.setStatus(id, { status, successorId }),
    onSuccess: () => {
      message.success('状态更新成功');
      setDisableTarget(null);
      disableForm.resetFields();
      refreshUsers();
    },
    onError: (error: unknown) => message.error(apiError(error, '操作失败')),
  });

  const openEdit = (record: UserRow) => {
    setEditTarget(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      phone: record.phone,
      employeeNo: record.employeeNo,
      gender: record.gender,
      birthDate: record.birthDate ? dayjs(record.birthDate) : undefined,
      alternatePhone: record.alternatePhone,
      wechat: record.wechat,
      address: [record.province, record.city, record.district].filter(Boolean) as string[],
      addressDetail: record.addressDetail,
      email: record.email,
      positionId: record.positionId,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
    form.resetFields();
  };

  const openTransfer = (record: UserRow) => {
    setTransferTarget(record);
    transferForm.setFieldsValue({
      newDepartmentId: record.departmentId,
      newRole: record.role,
    });
  };

  const successorsFor = (record: UserRow | null) =>
    userOptions.filter((user) =>
      user.id !== record?.id &&
      user.departmentId === record?.departmentId &&
      user.status === 'ACTIVE',
    );

  const changeStatus = (record: UserRow) => {
    if (record.role === 'ADMIN') {
      message.warning('系统管理员账号不允许被禁用');
      return;
    }
    if (record.status === 'INACTIVE') {
      modal.confirm({
        title: '确认启用该员工？',
        onOk: () => statusMutation.mutate({ id: record.id, status: 'ACTIVE' }),
      });
      return;
    }
    if (record.headOf) {
      setDisableTarget(record);
      disableForm.resetFields();
      return;
    }
    modal.confirm({
      title: '确认禁用该员工？',
      onOk: () => statusMutation.mutate({ id: record.id, status: 'INACTIVE' }),
    });
  };

  const columns: ProColumns<UserRow>[] = [
    { title: '工号', dataIndex: 'employeeNo', width: 100, fixed: 'left' },
    { title: '姓名', dataIndex: 'name', width: 90 },
    { title: '手机号', dataIndex: 'phone', width: 120, responsive: ['md'] },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 70,
      search: false,
      responsive: ['lg'],
      render: (_, record) => ({ MALE: '男', FEMALE: '女', UNKNOWN: '未知' }[record.gender ?? ''] ?? '-'),
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 110,
      valueEnum: {
        HEAD: { text: '部门负责人' },
        MEMBER: { text: '部门成员' },
      },
      render: (_, record) => (
        <Tag color={ROLE_COLORS[record.role]}>{ROLE_LABELS[record.role]}</Tag>
      ),
    },
    {
      title: '所属部门',
      dataIndex: 'departmentId',
      width: 110,
      responsive: ['md'],
      valueEnum: Object.fromEntries(departments.map((d) => [d.id, { text: d.name }])),
      render: (_, record) => record.department?.name ?? '-',
    },
    { title: '岗位', dataIndex: ['position', 'name'], width: 90, search: false, responsive: ['lg'] },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
      valueEnum: {
        ACTIVE: { text: '在职', status: 'Success' },
        INACTIVE: { text: '离职', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'default'}>
          {record.status === 'ACTIVE' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="编辑员工">
            <Button
              aria-label="编辑员工"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          {record.role !== 'ADMIN' && (
            <Tooltip title="员工调岗">
              <Button
                aria-label="员工调岗"
                size="small"
                icon={<SwapOutlined />}
                onClick={() => openTransfer(record)}
              />
            </Tooltip>
          )}
          <Tooltip title={record.status === 'ACTIVE' ? '禁用员工' : '启用员工'}>
            <Button
              aria-label={record.status === 'ACTIVE' ? '禁用员工' : '启用员工'}
              size="small"
              danger={record.status === 'ACTIVE'}
              icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => changeStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<UserRow>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        scroll={{ x: 'max-content' }}
        request={async (params) => {
          const response = await usersApi.getAll({
            employeeNo: params.employeeNo,
            name: params.name,
            phone: params.phone,
            departmentId: params.departmentId,
            role: params.role && params.role !== 'ADMIN' ? params.role : undefined,
            status: params.status,
          }) as unknown as UserRow[];
          // 员工管理只展示 HEAD / MEMBER，不含系统管理员
          const employees = response.filter((u) => u.role !== 'ADMIN');
          return { data: employees, success: true, total: employees.length };
        }}
        toolbar={{
          actions: [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTarget(null);
                form.resetFields();
                form.setFieldValue('gender', 'UNKNOWN');
                setDrawerOpen(true);
              }}
            >
              新建员工
            </Button>,
          ],
        }}
      />

      <Drawer
        title={editTarget ? '编辑员工' : '新建员工'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={680}
        footer={(
          <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
            保存
          </Button>
        )}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const { address, ...rest } = values;
            const [province, city, district] = (address as string[]) ?? [];
            const normalized = {
              ...rest,
              province: province || undefined,
              city: city || undefined,
              district: district || undefined,
              birthDate: values.birthDate?.format('YYYY-MM-DD'),
              idCardNo: values.idCardNo || undefined,
            };
            const payload = editTarget
              ? normalized
              : { ...normalized, password: values.phone };
            saveMutation.mutate(payload);
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeNo" label="工号" rules={[{ required: true, message: '请输入工号' }]}>
                <Input maxLength={32} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true },
                  { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="alternatePhone" label="备用电话" rules={[
                { pattern: /^1\d{10}$/, message: '请输入正确的备用电话' },
              ]}>
                <Input maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select options={[
                  { value: 'MALE', label: '男' },
                  { value: 'FEMALE', label: '女' },
                  { value: 'UNKNOWN', label: '未知' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" label="出生日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="wechat" label="微信号">
                <Input maxLength={64} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionId" label="岗位">
                <Select
                  allowClear
                  options={positions.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idCardNo"
                label="身份证号码"
                rules={[{ pattern: /^\d{17}[\dXx]$/, message: '身份证号码格式不正确' }]}
              >
                <Input
                  maxLength={18}
                  autoComplete="off"
                  placeholder={editTarget?.idCardMasked
                    ? `已保存 ${editTarget.idCardMasked}，留空不修改`
                    : '请输入18位身份证号码'}
                />
              </Form.Item>
            </Col>
            {!editTarget && (
              <>
                <Col span={12}>
                  <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                    <Select options={[
                      { value: 'HEAD', label: '部门负责人' },
                      { value: 'MEMBER', label: '部门成员' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="departmentId"
                    label="部门"
                    rules={[{ required: !!watchedRole, message: '员工必须选择部门' }]}
                  >
                    <TreeSelect
                      allowClear
                      placeholder="请选择部门"
                      treeData={buildDeptTree(departments)}
                      treeDefaultExpandAll
                      showSearch
                      treeNodeFilterProp="title"
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {editTarget && (
              <Col span={12}>
                <Form.Item
                  name="newPassword"
                  label="修改密码（不填则不修改）"
                  rules={[{ min: 8, message: '密码至少8位' }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item name="address" label="省市区">
                <Cascader
                  options={chinaRegions}
                  placeholder="请选择省/市/区"
                  showSearch
                  expandTrigger="hover"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="addressDetail" label="详细地址">
                <Input placeholder="街道/楼栋/门牌号" maxLength={200} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      <Modal
        title={`员工调岗：${transferTarget?.name ?? ''}`}
        open={!!transferTarget}
        confirmLoading={transferMutation.isPending}
        onCancel={() => {
          setTransferTarget(null);
          transferForm.resetFields();
        }}
        onOk={() => transferForm.submit()}
      >
        <Alert
          type="warning"
          showIcon
          message="调岗后，该员工名下的所有客户将自动转移到目标部门"
          style={{ marginBottom: 16 }}
        />
        <Form form={transferForm} layout="vertical" onFinish={(values) => transferMutation.mutate(values)}>
          <Form.Item name="newDepartmentId" label="目标部门" rules={[{ required: true }]}>
            <TreeSelect
              placeholder="请选择目标部门"
              treeData={buildDeptTree(departments)}
              treeDefaultExpandAll
              showSearch
              treeNodeFilterProp="title"
            />
          </Form.Item>
          <Form.Item name="newRole" label="调岗后角色" rules={[{ required: true }]}>
            <Select options={['HEAD', 'MEMBER'].map((value) => ({ value, label: ROLE_LABELS[value] }))} />
          </Form.Item>
          {transferTarget?.headOf && (
            <Form.Item name="successorId" label="原部门接任负责人" rules={[{ required: true }]}>
              <Select
                options={successorsFor(transferTarget).map((user) => ({ value: user.id, label: user.name }))}
                notFoundContent="该部门无其他在职员工可接任"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`禁用负责人：${disableTarget?.name ?? ''}`}
        open={!!disableTarget}
        confirmLoading={statusMutation.isPending}
        onCancel={() => {
          setDisableTarget(null);
          disableForm.resetFields();
        }}
        onOk={() => disableForm.submit()}
      >
        <Form
          form={disableForm}
          layout="vertical"
          onFinish={(values) => statusMutation.mutate({
            id: disableTarget!.id,
            status: 'INACTIVE',
            successorId: values.successorId,
          })}
        >
          <Form.Item name="successorId" label="接任负责人" rules={[{ required: true }]}>
            <Select
              options={successorsFor(disableTarget).map((user) => ({ value: user.id, label: user.name }))}
              notFoundContent="该部门无其他在职员工可接任，请先调入新成员"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function apiError(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } } };
  return responseError.response?.data?.message ?? fallback;
}
