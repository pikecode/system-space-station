import { defineConfig } from '@tarojs/cli';

const isDebugBuild = process.env.TARO_DEBUG === 'true';

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
    TARO_APP_API_URL: JSON.stringify(process.env.TARO_APP_API_URL ?? 'https://zganquandao.com/api'),
  },
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  enableSourceMap: isDebugBuild,
  sourceMapType: 'source-map',
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      url: { enable: true, config: { limit: 1024 } },
      cssModules: { enable: false },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', require('path').resolve(__dirname, '..', 'src'));
      if (isDebugBuild) {
        chain.mode('development');
        chain.devtool('source-map');
        chain.optimization.minimize(false);
      }
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
