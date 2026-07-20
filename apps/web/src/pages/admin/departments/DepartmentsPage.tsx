import { useState } from 'react';
import { Tree, Card, Button, Drawer, Form, Input, Select, Space, Tag, Spin, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../../../services/departments';

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
  type: string;
  parentId?: string;
  head?: { name: string };
  province?: string;
  city?: string;
  district?: string;
  addressDetail?: string;
  description?: string;
  key: string;
  title: string;
  children: DeptNode[];
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
  const { message } = App.useApp();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<DeptNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeptNode | null>(null);
  const [form] = Form.useForm();

  const { data = [], isLoading } = useQuery<DeptNode[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll() as unknown as Promise<DeptNode[]>,
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
      setSelected(null);
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message ?? '停用失败');
    },
  });

  const treeData = buildTreeData(data);

  const openCreate = (parentId?: string) => {
    setEditTarget(null);
    form.resetFields();
    if (parentId) form.setFieldValue('parentId', parentId);
    setDrawerOpen(true);
  };

  const openEdit = (dept: DeptNode) => {
    setEditTarget(dept);
    form.setFieldsValue(dept);
    setDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      <Card
        style={{ width: 320, flexShrink: 0 }}
        title="部门结构"
        extra={
          <Button
            icon={<PlusOutlined />}
            type="primary"
            size="small"
            onClick={() => openCreate()}
          >
            新建
          </Button>
        }
      >
        {isLoading ? (
          <Spin />
        ) : (
          <Tree
            treeData={treeData}
            onSelect={(_, { node }) => setSelected(node as DeptNode)}
            titleRender={(node) => {
              const dept = node as DeptNode;
              return (
                <span>
                  {dept.title}
                  <Tag
                    color={DEPT_TYPE_COLORS[dept.type]}
                    style={{ marginLeft: 6, fontSize: 11 }}
                  >
                    {DEPT_TYPE_LABELS[dept.type]}
                  </Tag>
                </span>
              );
            }}
          />
        )}
      </Card>

      <Card style={{ flex: 1 }} title={selected ? selected.name : '请选择部门'}>
        {selected && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <b>类型：</b>
              <Tag color={DEPT_TYPE_COLORS[selected.type]}>
                {DEPT_TYPE_LABELS[selected.type]}
              </Tag>
            </div>
            {selected.head && (
              <div>
                <b>负责人：</b>
                {selected.head.name}
              </div>
            )}
            {selected.province && (
              <div>
                <b>地址：</b>
                {[selected.province, selected.city, selected.district, selected.addressDetail]
                  .filter(Boolean)
                  .join(' ')}
              </div>
            )}
            {selected.description && (
              <div>
                <b>说明：</b>
                {selected.description}
              </div>
            )}
            <Space>
              <Button onClick={() => openEdit(selected)}>编辑</Button>
              <Button onClick={() => openCreate(selected.id)}>新建子部门</Button>
              <Button
                danger
                loading={disableMutation.isPending}
                onClick={() => disableMutation.mutate(selected.id)}
              >
                停用
              </Button>
            </Space>
          </Space>
        )}
      </Card>

      <Drawer
        title={editTarget ? '编辑部门' : '新建部门'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditTarget(null);
          form.resetFields();
        }}
        width={480}
        footer={
          <Button
            type="primary"
            loading={createMutation.isPending}
            onClick={() => form.submit()}
          >
            保存
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="部门类型" rules={[{ required: true }]}>
            <Select
              options={Object.entries(DEPT_TYPE_LABELS).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Select
              allowClear
              placeholder="不选则为顶级"
              options={data.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="部门说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="地址">
            <Space.Compact>
              <Form.Item name="province" noStyle>
                <Input placeholder="省" style={{ width: 80 }} />
              </Form.Item>
              <Form.Item name="city" noStyle>
                <Input placeholder="市" style={{ width: 80 }} />
              </Form.Item>
              <Form.Item name="district" noStyle>
                <Input placeholder="区" style={{ width: 80 }} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="addressDetail" label="详细地址">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
