import { defineConfig } from 'umi';

export default defineConfig({
  title: '项目名称',
  dva: {
    hmr: true,
    immer: true,
  },
  history: {
    type: 'hash',
  },
  publicPath: '/',
});
