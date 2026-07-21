import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import '../../../tokens.css';
import App from './App';

dayjs.locale('zh-cn');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary:        '#1677ff',
            /* colorBgBase must stay #fff so Ant Design derives white for
               colorBgContainer/colorBgElevated. Setting it to #f5f7fa caused
               Drawer/Modal backgrounds to become indistinguishable from the
               page background — users clicked buttons and saw nothing open. */
            colorBgBase:         '#ffffff',
            colorBgLayout:       '#f5f7fa',  /* page-level background only */
            colorTextBase:       '#1d2129',
            colorBorder:         '#e5e8ef',
            colorTextSecondary:  '#86909c',
            borderRadius:        6,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            motionDurationFast:  '150ms',
            motionDurationMid:   '220ms',
            motionEaseOut:       'cubic-bezier(0.16, 1, 0.3, 1)',
          },
          components: {
            Button: {
              primaryShadow:   'none',
              defaultShadow:   'none',
              controlHeight:   36,
            },
            Input: {
              controlHeight:   36,
            },
            Select: {
              controlHeight:   36,
            },
            Table: {
              borderColor:     '#e5e8ef',
              headerBg:        '#eef1f6',
            },
            Menu: {
              itemSelectedBg:  '#e8f3ff',
              itemSelectedColor: '#1677ff',
            },
          },
        }}
      >
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
