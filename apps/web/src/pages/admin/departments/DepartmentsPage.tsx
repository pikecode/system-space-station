import { lazy, Suspense, useDeferredValue, useState, useMemo, useRef } from 'react';
import {
  Table, Button, Drawer, Form, Input, Select, Space, Tag, App,
  Cascader, Modal, Tooltip, Segmented, Checkbox, Tree, Empty,
} from 'antd';
import { TableOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PlusOutlined, EditOutlined, PlusCircleOutlined, StopOutlined, UserOutlined,
  RightOutlined, DownOutlined, CopyOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { departmentsApi } from '../../../services/departments';
import { usersApi } from '../../../services/users';
import chinaRegions from '../../../utils/chinaRegions';
import ProTable from '../../../components/BusinessProTable';
import { generateTemporaryPassword } from '../../../utils/password';
import { getApiErrorMessage } from '../../../utils/apiError';
import {
  ALLOWED_CHILD_TYPES,
  canDepartmentLoginMiniApp,
  DEPARTMENT_CAPACITY,
  DEPARTMENT_TYPE_COLORS,
  DEPARTMENT_TYPE_LABELS,
  VALID_PARENT_TYPES,
} from 'shared';
import './DepartmentsPage.css';

const DeptMindMap = lazy(() => import('./DeptMindMap'));

const DEPT_TYPE_LABELS = DEPARTMENT_TYPE_LABELS as Record<string, string>;
const DEPT_TYPE_COLORS = DEPARTMENT_TYPE_COLORS as Record<string, string>;
const VALID_PARENT_TYPE = VALID_PARENT_TYPES as Record<string, string[]>;
const ALLOWED_CHILD_TYPE = ALLOWED_CHILD_TYPES as Record<string, string[]>;
const DEPT_CAPACITY = DEPARTMENT_CAPACITY as Record<string, number>;

interface DeptNode {
  id: string;
  name: string;
  code?: string;
  type: string;
  parentId?: string;
  head?: { id: string; name: string };
  province?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  description?: string;
  _count?: { users: number };
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

type ViewMode = 'workbench' | 'table' | 'chart';

// 按部门名称生成 code 建议：每个汉字取拼音首字母，最多4位
function suggestDeptCode(name: string): string {
  if (!name) return '';
  const thresholds = [0x5208,0x51C9,0x51FB,0x5306,0x538B,0x5427,0x5446,0x53D1,0x54E6,0x554a,0x5F2F,0x6492,0x6497,0x6614,0x62FF,0x64E6,0x671F,0x6AF3,0x71C3,0x79D8,0x7A7A,0x8377,0x8D34,0x9102];
  const letters   = ['G',  'L',  'J',  'Z',  'Y',  'B',  'D',  'F',  'O',  'A',  'W',  'S',  'P',  'X',  'N',  'C',  'Q',  'K',  'R',  'M',  'K',  'H',  'T',  'E' ];
  const sorted = thresholds
    .map((t, i) => [t, letters[i]] as [number, string])
    .sort((a, b) => a[0] - b[0]);

  return [...name]
    .filter((c) => /[一-龥a-zA-Z]/.test(c))
    .slice(0, 4)
    .map((c) => {
      if (/[a-zA-Z]/.test(c)) return c.toUpperCase();
      const cp = c.codePointAt(0) ?? 0;
      let result = 'Z';
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (cp >= sorted[i][0]) { result = sorted[i][1]; break; }
      }
      return result;
    })
    .join('')
    .toUpperCase();
}

export default function DepartmentsPage() {
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType>();
  const expansionInitialized = useRef(false);
  const [departments, setDepartments] = useState<DeptNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>();
  const [viewMode, setViewMode] = useState<ViewMode>('workbench');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeptNode | null>(null);
  const [parentContext, setParentContext] = useState<DeptNode | null>(null);
  // 人员管理
  const [memberDept, setMemberDept] = useState<DeptNode | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberForm] = Form.useForm();
  // 选择已有人员
  const [selectUserOpen, setSelectUserOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const deferredUserSearch = useDeferredValue(userSearch);
  const [form] = Form.useForm();
  const watchedType = Form.useWatch('type', form);
  const codeManuallyEdited = useRef(false);

  const {
    data: organizationMembers = [],
    isLoading: organizationMembersLoading,
    refetch: refetchOrganizationMembers,
  } = useQuery<MemberRow[]>({
    queryKey: ['organization-members'],
    queryFn: () => usersApi.getOrganizationMembers<MemberRow>(),
    enabled: viewMode === 'workbench' || viewMode === 'chart' || !!memberDept,
  });

  const { data: assignableUsers = [], refetch: refetchAssignableUsers } = useQuery<MemberRow[]>({
    queryKey: ['assignable-members', deferredUserSearch],
    queryFn: () => usersApi.getAssignableMembers<MemberRow>(deferredUserSearch || undefined),
    enabled: selectUserOpen,
  });

  const membersByDept = useMemo<Record<string, MemberRow[]>>(() => {
    const map: Record<string, MemberRow[]> = {};
    organizationMembers.forEach((u) => {
      if (u.departmentId) {
        if (!map[u.departmentId]) map[u.departmentId] = [];
        map[u.departmentId].push(u);
      }
    });
    return map;
  }, [organizationMembers]);

  const treeRoots = useMemo(() => buildTreeData(departments), [departments]);
  const selectedDept = useMemo(
    () => departments.find((item) => item.id === selectedDeptId) ?? departments[0],
    [departments, selectedDeptId],
  );
  const selectedDeptMembers = selectedDept ? (membersByDept[selectedDept.id] ?? []) : [];

  const orgStats = useMemo(() => {
    const totalMembers = departments.reduce((sum, dept) => sum + (dept._count?.users ?? 0), 0);
    const missingHeadCount = departments.filter((dept) => dept.type !== 'GOVERNANCE' && !dept.head).length;
    const capacityRiskCount = departments.filter((dept) => {
      const cap = DEPT_CAPACITY[dept.type];
      return cap && (dept._count?.users ?? 0) >= cap;
    }).length;
    const miniAppUsers = departments.reduce((sum, dept) => {
      const parent = dept.parentId ? departments.find((item) => item.id === dept.parentId) : undefined;
      const canLogin = canDepartmentLoginMiniApp(dept.type, dept.name) ||
        canDepartmentLoginMiniApp(parent?.type, parent?.name);
      return canLogin ? sum + (dept._count?.users ?? 0) : sum;
    }, 0);
    return {
      totalDepartments: departments.length,
      totalMembers,
      missingHeadCount,
      capacityRiskCount,
      miniAppUsers,
    };
  }, [departments]);

  const addMemberMutation = useMutation({
    mutationFn: (data: unknown) => usersApi.create(data),
    onSuccess: () => {
      message.success('人员已添加');
      setAddMemberOpen(false);
      addMemberForm.resetFields();
      actionRef.current?.reload();
      refetchOrganizationMembers();
      refetchAssignableUsers();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '添加失败');
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({ userIds, deptId }: { userIds: string[]; deptId: string }) =>
      Promise.all(userIds.map((userId) =>
        usersApi.transfer(userId, { newDepartmentId: deptId, newRole: 'MEMBER' }),
      )),
    onSuccess: (_, { userIds }) => {
      message.success(`已将 ${userIds.length} 人加入该部门`);
      setSelectUserOpen(false);
      setUserSearch('');
      setSelectedUserIds([]);
      actionRef.current?.reload();
      refetchOrganizationMembers();
      refetchAssignableUsers();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ userId, role, successorId, deptId }: {
      userId: string;
      role: string;
      successorId?: string;
      deptId?: string;
    }) =>
      usersApi.transfer(userId, { newDepartmentId: deptId ?? memberDept!.id, newRole: role, ...(successorId ? { successorId } : {}) }),
    onSuccess: () => {
      message.success('负责人已更新');
      actionRef.current?.reload();
      refetchOrganizationMembers();
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '操作失败');
    },
  });

  const handleSetHead = (member: MemberRow, dept?: DeptNode, deptMembers: MemberRow[] = selectedDeptMembers) => {
    const targetDept = dept ?? memberDept;
    if (!targetDept) return;
    const currentHead = deptMembers.find((m) => m.role === 'HEAD');
    if (currentHead) {
      modal.confirm({
        title: `将「${member.name}」设为负责人`,
        content: `「${currentHead.name}」将变为普通成员，确认替换吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => setRoleMutation.mutate({
          userId: currentHead.id,
          role: 'MEMBER',
          successorId: member.id,
          deptId: targetDept.id,
        }),
      });
    } else {
      setRoleMutation.mutate({ userId: member.id, role: 'HEAD', deptId: targetDept.id });
    }
  };

  const removeMemberFromCurrentDept = (member: MemberRow, dept?: DeptNode) => {
    const targetDept = dept ?? memberDept;
    if (!targetDept) return;
    modal.confirm({
      title: `将「${member.name}」移出「${targetDept.name}」？`,
      content: '移出后该人员仍保留账号；若名下仍有客户，请先调岗或转移客户。',
      okText: '确认移出',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => usersApi.removeFromDepartment(member.id)
        .then(() => {
          message.success('已移出');
          actionRef.current?.reload();
          refetchOrganizationMembers();
          refetchAssignableUsers();
        })
        .catch((error: unknown) => message.error(getApiErrorMessage(error, '操作失败'))),
    });
  };

  const openAddMember = (dept: DeptNode) => {
    setMemberDept(dept);
    addMemberForm.resetFields();
    addMemberForm.setFieldsValue({
      departmentId: dept.id,
      userType: dept.type === 'DIVISION' ? 'PARTNER' : 'EMPLOYEE',
      role: 'MEMBER',
      password: generateTemporaryPassword(),
    });
    setAddMemberOpen(true);
  };

  const openSelectMember = (dept: DeptNode) => {
    setMemberDept(dept);
    setSelectedUserIds([]);
    setSelectUserOpen(true);
  };

  const focusDepartmentMembers = (dept: DeptNode) => {
    setSelectedDeptId(dept.id);
    setViewMode('workbench');
  };

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
      const allowedTypes = ALLOWED_CHILD_TYPE[parentContext.type] || [];
      return baseOptions.filter((opt) => allowedTypes.includes(opt.value));
    }

    return baseOptions;
  }, [hqExists, isEditingHQ, parentContext]);

  const openCreate = (parent?: DeptNode) => {
    setEditTarget(null);
    setParentContext(parent ?? null);
    codeManuallyEdited.current = false;
    form.resetFields();
    if (parent) {
      form.setFieldValue('parentId', parent.id);
      const allowedTypes = ALLOWED_CHILD_TYPE[parent.type] ?? [];
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

  const renderOrgTreeTitle = (record: DeptNode) => {
    const count = record._count?.users ?? 0;
    const cap = DEPT_CAPACITY[record.type];
    return (
      <div className="dept-tree-node">
        <span
          className="dept-tree-node__dot"
          style={{ backgroundColor: DEPT_TYPE_COLORS[record.type] ?? '#86909c' }}
        />
        <span className="dept-tree-node__name">{record.name}</span>
        <span className="dept-tree-node__meta">
          {cap ? `${count}/${cap}` : `${count}人`}
        </span>
      </div>
    );
  };

  const toOrgTreeData = (nodes: DeptNode[]): any[] =>
    nodes.map((node) => ({
      key: node.id,
      title: renderOrgTreeTitle(node),
      children: node.children?.length ? toOrgTreeData(node.children) : undefined,
    }));


  const renderWorkbench = () => (
    <div className="dept-workbench">
      <div className="dept-stats">
        <div className="dept-stat">
          <span className="dept-stat__label">部门总数</span>
          <strong>{orgStats.totalDepartments}</strong>
        </div>
        <div className="dept-stat">
          <span className="dept-stat__label">在职人数</span>
          <strong>{orgStats.totalMembers}</strong>
        </div>
        <div className={`dept-stat${orgStats.missingHeadCount > 0 ? ' dept-stat--warning' : ''}`}>
          <span className="dept-stat__label">负责人缺失</span>
          <strong>{orgStats.missingHeadCount}</strong>
        </div>
        <div className={`dept-stat${orgStats.capacityRiskCount > 0 ? ' dept-stat--danger' : ''}`}>
          <span className="dept-stat__label">满员部门</span>
          <strong>{orgStats.capacityRiskCount}</strong>
        </div>
        <div className="dept-stat">
          <span className="dept-stat__label">小程序可登录人数</span>
          <strong>{orgStats.miniAppUsers}</strong>
        </div>
      </div>

      <div className="dept-workbench__body">
        <section className="dept-org-panel">
          <div className="dept-panel-head">
            <div>
              <div className="dept-panel-head__title">组织树</div>
              <div className="dept-panel-head__desc">点击部门查看详情和成员</div>
            </div>
            <Button
              size="small"
              onClick={() => {
                const allExpanded = expandedKeys.length === departments.length;
                setExpandedKeys(allExpanded ? [] : departments.map((item) => item.id));
              }}
            >
              {expandedKeys.length === departments.length ? '收起' : '展开'}
            </Button>
          </div>
          {treeRoots.length > 0 ? (
            <Tree
              className="dept-org-tree"
              blockNode
              showLine
              selectedKeys={selectedDept?.id ? [selectedDept.id] : []}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              onSelect={(keys) => {
                const nextKey = keys[0]?.toString();
                if (nextKey) setSelectedDeptId(nextKey);
              }}
              treeData={toOrgTreeData(treeRoots)}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无部门" />
          )}
        </section>

        <section className="dept-detail-panel">
          {selectedDept ? (
            <>
              <div className="dept-detail__hero">
                <div>
                  <Space size={8} wrap>
                    <Tag color={DEPT_TYPE_COLORS[selectedDept.type]}>{DEPT_TYPE_LABELS[selectedDept.type]}</Tag>
                    {selectedDept.code && <Tag>{selectedDept.code}</Tag>}
                    {DEPT_CAPACITY[selectedDept.type] && (
                      <Tag color={(selectedDept._count?.users ?? 0) >= DEPT_CAPACITY[selectedDept.type] ? 'red' : 'blue'}>
                        容量 {(selectedDept._count?.users ?? 0)}/{DEPT_CAPACITY[selectedDept.type]}
                      </Tag>
                    )}
                  </Space>
                  <h2>{selectedDept.name}</h2>
                  <p>{selectedDept.description || [selectedDept.province, selectedDept.city, selectedDept.district].filter(Boolean).join(' ') || '暂无说明'}</p>
                </div>
                <Space wrap>
                  <Button icon={<EditOutlined />} onClick={() => openEdit(selectedDept)}>编辑部门</Button>
                  {(ALLOWED_CHILD_TYPE[selectedDept.type] ?? []).length > 0 && (
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openCreate(selectedDept)}>
                      新增子部门
                    </Button>
                  )}
                </Space>
              </div>

              <div className="dept-detail__members">
                <div className="dept-section-title dept-section-title--actions">
                  <span>
                    直属成员
                    {DEPT_CAPACITY[selectedDept.type] ? (
                      <span style={{ marginLeft: 8, color: (selectedDept._count?.users ?? 0) >= DEPT_CAPACITY[selectedDept.type] ? '#cf1322' : '#86909c', fontWeight: 400, fontSize: 12 }}>
                        {selectedDept._count?.users ?? 0}/{DEPT_CAPACITY[selectedDept.type]}人
                      </span>
                    ) : (
                      <span style={{ marginLeft: 8, color: '#86909c', fontWeight: 400, fontSize: 12 }}>
                        {selectedDept._count?.users ?? 0}人
                      </span>
                    )}
                  </span>
                  <Space size={8}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => openAddMember(selectedDept)}
                    >
                      新增人员
                    </Button>
                    <Button size="small" icon={<UserOutlined />} onClick={() => openSelectMember(selectedDept)}>
                      选择已有
                    </Button>
                  </Space>
                </div>
                <Table<MemberRow>
                  rowKey="id"
                  size="small"
                  dataSource={selectedDeptMembers}
                  loading={organizationMembersLoading}
                  pagination={false}
                  locale={{ emptyText: '暂无直属成员' }}
                  columns={[
                    {
                      title: '编号',
                      dataIndex: 'employeeNo',
                      width: 110,
                      render: (v) => v ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4e5969' }}>{v}</span>
                      ) : <span style={{ color: '#c9cdd4' }}>-</span>,
                    },
                    { title: '姓名', dataIndex: 'name', width: 90 },
                    { title: '手机号', dataIndex: 'phone', width: 120 },
                    {
                      title: '角色',
                      dataIndex: 'role',
                      width: 80,
                      render: (r) => <Tag color={r === 'HEAD' ? 'blue' : 'default'}>{r === 'HEAD' ? '负责人' : '成员'}</Tag>,
                    },
                    {
                      title: '类型',
                      dataIndex: 'userType',
                      width: 80,
                      render: (t) => <Tag color={t === 'PARTNER' ? 'orange' : 'default'}>{t === 'PARTNER' ? '合伙人' : '员工'}</Tag>,
                    },
                    {
                      title: '其他',
                      key: 'extra',
                      width: 120,
                      render: (_, m) => (
                        <Space size={4}>
                          {m.hasLicense && <Tag color="gold">持证</Tag>}
                          {m.shareCode && <Tag style={{ fontFamily: 'monospace' }}>{m.shareCode}</Tag>}
                        </Space>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 110,
                      render: (_, member) => member.role === 'HEAD' ? null : (
                        <Space size={4}>
                          <Button
                            size="small"
                            type="link"
                            style={{ padding: 0 }}
                            loading={setRoleMutation.isPending}
                            onClick={() => handleSetHead(member, selectedDept, selectedDeptMembers)}
                          >
                            设负责人
                          </Button>
                          <Button
                            size="small"
                            danger
                            type="link"
                            style={{ padding: 0 }}
                            onClick={() => removeMemberFromCurrentDept(member, selectedDept)}
                          >
                            移出
                          </Button>
                        </Space>
                      ),
                    },
                  ] as ColumnsType<MemberRow>}
                />
              </div>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择部门" />
          )}
        </section>
      </div>
    </div>
  );

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
        const count = record._count?.users ?? 0;
        const cap = DEPT_CAPACITY[record.type];
        return (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => focusDepartmentMembers(record)}
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
      title: '地址',
      key: 'address',
      width: 200,
      render: (_, record) => {
        const parts = [record.province, record.city, record.district].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : '-';
      },
    },
    {
      title: '负责人',
      key: 'head',
      width: 100,
      render: (_, record) => record.head?.name || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => {
        const canAddChild = record.type === 'MARKET'; // 只有市场部可以创建事业部
        return (
          <Space size={4}>
            <Tooltip title="查看成员" getPopupContainer={() => document.body}>
              <Button size="small" icon={<UserOutlined />} onClick={() => focusDepartmentMembers(record)} />
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

  const viewSwitcher = (
    <Segmented
      value={viewMode}
      onChange={(v) => setViewMode(v as ViewMode)}
      options={[
        { value: 'workbench', label: '工作台', icon: <BranchesOutlined /> },
        { value: 'table', label: '列表', icon: <TableOutlined /> },
        { value: 'chart', label: '架构图', icon: <ApartmentOutlined /> },
      ]}
    />
  );

  return (
    <>
      <div className="dept-view-bar">
        <div>
          <div className="dept-view-bar__title">部门管理</div>
          <div className="dept-view-bar__desc">在工作台、列表和架构图之间切换查看组织结构</div>
        </div>
        <Space wrap>
          {viewSwitcher}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
            新建部门
          </Button>
        </Space>
      </div>
      <ProTable<DeptNode>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const response = await departmentsApi.getAll() as unknown as DeptNode[];
          const list = Array.isArray(response) ? response : [];
          setDepartments(list);
          if (!expansionInitialized.current) {
            setExpandedKeys(list.map((d) => d.id));
            setSelectedDeptId((current) => current ?? list[0]?.id);
            expansionInitialized.current = true;
          }
          return { data: buildTreeData(list), success: true, total: list.length };
        }}
        search={false}
        pagination={false}
        headerTitle={false}
        options={false}
        tableRender={viewMode === 'workbench' ? renderWorkbench : viewMode === 'chart' ? () => (
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
            <Suspense fallback={<div style={{ padding: 24 }}>组织架构加载中...</div>}>
              <DeptMindMap roots={buildTreeData(departments)} membersByDept={membersByDept} />
            </Suspense>
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
          },
        }}
      />

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
            <Space>
              <Button onClick={() => {
                setDrawerOpen(false);
                setEditTarget(null);
                setParentContext(null);
                form.resetFields();
              }}>取消</Button>
              <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>
                保存
              </Button>
            </Space>
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
              <Input
                onChange={(e) => {
                  if (!codeManuallyEdited.current) {
                    form.setFieldValue('code', suggestDeptCode(e.target.value));
                  }
                }}
              />
            </Form.Item>
          )}
          <Form.Item
            name="code"
            label="部门短码"
            rules={[{ required: !editTarget, message: '请输入部门短码' }]}
            extra={editTarget ? '短码创建后不可修改，仅供查看' : '用作员工编号前缀，系统已根据名称自动建议，可手动修改'}
          >
            <Input
              placeholder="如 GOV、STR"
              maxLength={30}
              onChange={() => { codeManuallyEdited.current = true; }}
              style={{ textTransform: 'uppercase', ...(editTarget ? { background: '#fafafa', color: '#666' } : {}) }}
              readOnly={!!editTarget}
            />
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
          onFinish={(values) => addMemberMutation.mutate(values)}
        >
          <Form.Item name="userType" label="人员类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'EMPLOYEE', label: '员工（公司正式）' },
              { value: 'PARTNER', label: '合伙人（事业部）' },
            ]} onChange={() => {
              if (!addMemberForm.getFieldValue('password')) {
                addMemberForm.setFieldValue('password', generateTemporaryPassword());
              }
            }} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="phone" label="手机号"
            rules={[{ required: true }, { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }]}>
            <Input maxLength={11} />
          </Form.Item>
          {!memberDept?.code && (
            <Form.Item
              name="employeeNo"
              label="编号"
              extra="部门未配置编号短码，请手动输入编号（可选）"
            >
              <Input maxLength={32} placeholder="可选" />
            </Form.Item>
          )}
          {canDepartmentLoginMiniApp(memberDept?.type, memberDept?.name) && (
            <Form.Item
              name="password"
              label="初始密码"
              extra="人员可使用编号和该密码登录小程序"
              rules={[{ required: true, message: '请生成初始密码' }, { min: 8, message: '密码至少8位' }]}
            >
              <Input.Password
                autoComplete="new-password"
                suffix={(
                  <Tooltip title="复制初始密码">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      aria-label="复制初始密码"
                      onClick={() => {
                        const password = addMemberForm.getFieldValue('password');
                        if (password) {
                          void navigator.clipboard.writeText(password)
                            .then(() => message.success('初始密码已复制'))
                            .catch(() => message.error('复制失败，请手动复制'));
                        }
                      }}
                    />
                  </Tooltip>
                )}
              />
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
        onCancel={() => { setSelectUserOpen(false); setUserSearch(''); setSelectedUserIds([]); }}
        onOk={() => {
          if (selectedUserIds.length === 0) { message.warning('请至少选择一人'); return; }
          transferMutation.mutate({ userIds: selectedUserIds, deptId: memberDept!.id });
        }}
        okText={`加入${selectedUserIds.length > 0 ? `（${selectedUserIds.length}人）` : ''}`}
        confirmLoading={transferMutation.isPending}
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
          dataSource={assignableUsers}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ y: 280 }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedUserIds,
            onChange: (keys) => setSelectedUserIds(keys as string[]),
          }}
          columns={[
            { title: '姓名', dataIndex: 'name', width: 90 },
            { title: '手机号', dataIndex: 'phone', width: 120 },
            {
              title: '类型',
              dataIndex: 'userType',
              width: 70,
              render: (t) => <Tag color={t === 'PARTNER' ? 'orange' : 'default'}>{t === 'PARTNER' ? '合伙人' : '员工'}</Tag>,
            },
          ] as ColumnsType<MemberRow>}
          locale={{ emptyText: '无可选人员' }}
        />
      </Modal>
    </>
  );
}
