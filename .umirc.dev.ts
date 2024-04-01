import { defineConfig } from 'umi';

export default defineConfig({
  mock: {},
  nodeModulesTransform: {
    type: 'none',
  },
  proxy: {
    // '/api': {
    //   target: 'https://www.hzszsk.com/',
    //   changeOrigin: true,
    //   secure: false,
    //   pathRewrite: { '^/api': '/dev' },
    // },
  },
  fastRefresh: {},
});
