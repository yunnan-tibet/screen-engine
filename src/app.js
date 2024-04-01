import { persistEnhancer } from 'dva-model-persist';
import storage from 'dva-model-persist/lib/storage';

export const dva = {
  config: {
    extraEnhancers: [persistEnhancer({ storage, whitelist: ['user'] })],
  },
};
