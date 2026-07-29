import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'miniapp',
  date: '2026-07-21',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  env: {
    TARO_APP_API_URL: JSON.stringify(process.env.TARO_APP_API_URL ?? 'https://8.130.168.178/api'),
  },
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: { enable: false },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', require('path').resolve(__dirname, '..', 'src'));
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    router: { mode: 'browser' },
    prebundle: { enable: false },
    postcss: {
      autoprefixer: { enable: true },
      cssModules: { enable: false },
    },
    devServer: {
      port: 5300,
      proxy: {
        '/api': {
          target: 'http://localhost:4100',
          changeOrigin: true,
        },
      },
    },
  },
});
