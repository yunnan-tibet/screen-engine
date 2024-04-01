export const isDev = process.env.NODE_ENV === 'development';
// 业务API转发
export const API = `${isDev ? '/api' : ''}/fishery/manage/api`;
// 数梦用户中心转发
export const USER_API = '';
