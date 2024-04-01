import { Reducer } from 'umi';
import { UserService } from '@/service';

export interface IUserState {
  userId: string;
  userName: string;
  // 权限列表
  permissions: string[];
}

type IUserModal = {
  namespace: 'user';
  state: IUserState;
  reducers: {
    save: Reducer;
    clear: Reducer;
  };
  effects: {
    getUserInfo: any;
    logout: any;
  };
  subscriptions: any;
};

const UserModal: IUserModal = {
  namespace: 'user',
  state: {
    userId: '',
    userName: '',
    permissions: [],
  },
  effects: {
    *getUserInfo(_: any, { call, put }: any): any {
      const [err, data] = yield call(UserService.getLoginUserInfo);
      if (!err) {
        const { id, name, permissionCodes } = data.data;
        yield put({
          type: 'save',
          payload: {
            ...data,
            userId: id,
            userName: name,
            permissions: permissionCodes,
          },
        });
      }
    },
    *logout({ payload }: any, { call, put }: any): any {
      const { userId } = payload;
      const [err] = yield call(UserService.logout, userId);
      if (!err) {
        yield put({ type: 'clear' });
      }
    },
  },
  subscriptions: {
    setup({ dispatch }: any) {
      // 页面加载获取用户信息等，只会执行一次
      dispatch({
        type: 'getUserInfo',
      });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {};
    },
  },
};

export default UserModal;
