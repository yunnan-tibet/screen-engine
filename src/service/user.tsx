import { USER_API } from '@/constants';
import request from '@/utils/request';

// 获取用户信息
export function getLoginUserInfo() {
  return request.get({
    url: `${USER_API}/sys/authority/getLoginUser`,
  });
}

// 登出
export function logout(userId: string) {
  return request.post({
    url: `${USER_API}/sys/authority/logout`,
    data: {},
    params: {
      userId,
    },
  });
}
