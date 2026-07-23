import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface DeptNode {
  id: string;
  name: string;
  type: string;
  children: DeptNode[];
}

const TYPE_COLOR: Record<string, string> = {
  GOVERNANCE: '#eb2f96',
  HQ:         '#f5222d',
  CENTER:     '#722ed1',
  DIRECT:     '#1677ff',
  MARKET:     '#52c41a',
  DIVISION:   '#fa8c16',
};

const TYPE_LABEL: Record<string, string> = {
  GOVERNANCE: '治理层', HQ: '总经办', CENTER: '中心',
  DIRECT: '直属部门', MARKET: '市场部', DIVISION: '事业部',
};

const BAR = 0.055;

function toNode(node: DeptNode): object {
  const color = TYPE_COLOR[node.type] ?? '#8c8c8c';
  return {
    name: node.name,
    value: node.type,
    itemStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [
          { offset: 0,         color },
          { offset: BAR,       color },
          { offset: BAR + 0.01, color: '#ffffff' },
          { offset: 1,         color: '#ffffff' },
        ],
      },
      // 使用背景色边框分隔相邻节点
      borderColor: '#f5f7fa',
      borderWidth: 4,
    },
    children: node.children?.length ? node.children.map(toNode) : undefined,
  };
}

export default function DeptMindMap({ roots }: { roots: DeptNode[] }) {
  const root = roots.length === 1
    ? roots[0]
    : { id: '__root__', name: '组织架构', type: 'HQ', children: roots };

  const option: EChartsOption = {
    backgroundColor: '#f5f7fa',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e5e8ef',
      borderWidth: 1,
      padding: [8, 12],
      formatter: (params: any) => {
        const type = TYPE_LABEL[params.data?.value] ?? '';
        const color = TYPE_COLOR[params.data?.value] ?? '#999';
        return `<b style="color:#1d2129">${params.name}</b><br/>
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;
            background:${color};margin-right:5px;vertical-align:middle"></span>
          <span style="color:#86909c;font-size:11px">${type}</span>`;
      },
    },
    series: [
      {
        type: 'tree',
        data: [toNode(root)],
        orient: 'LR',
        roam: true,
        initialTreeDepth: 100,
        top: '2%',
        bottom: '2%',
        left: '1%',
        right: '20%',
        symbol: 'rect',
        symbolSize: [108, 36],
        label: {
          position: 'insideLeft',
          verticalAlign: 'middle',
          align: 'left',
          fontSize: 11,
          color: '#1d2129',
          fontWeight: 500,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          padding: [0, 6, 0, 10],
          overflow: 'truncate',
          width: 90,
          ellipsis: '…',
        },
        leaves: {
          label: {
            position: 'insideLeft',
            verticalAlign: 'middle',
            align: 'left',
            padding: [0, 6, 0, 10],
          },
        },
        lineStyle: {
          color: '#c8d0dc',
          curveness: 0.4,
          width: 1.5,
        },
        itemStyle: {
          color: '#fff',
          borderColor: '#f5f7fa',
          borderWidth: 4,
        },
        emphasis: {
          focus: 'ancestor',
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' },
        },
        expandAndCollapse: true,
        animationDuration: 200,
        animationDurationUpdate: 300,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#f5f7fa' }}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge
      />
    </div>
  );
}
