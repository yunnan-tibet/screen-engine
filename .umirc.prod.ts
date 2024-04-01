import { defineConfig } from 'umi';

export default defineConfig({
  hash: true,
  mfsu: {},
  nodeModulesTransform: {
    type: 'all',
  },
  // 按需加载，可以加入自己的loading切换组件
  // dynamicImport: {},
  // 兼容处理
  targets: {
    chrome: 68,
  },
  publicPath: './',
});
