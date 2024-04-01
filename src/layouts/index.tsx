import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { IUserState, useSelector, useLocation } from 'umi';
import { IAppState } from '@/models';
import Container from './container';
import Login from './login';
import { routerGuard } from '@/utils/routeGuard';

interface IProps {
  children: JSX.Element;
}

export default function Layouts({ children }: IProps) {
  const user: IUserState = useSelector((state: IAppState) => state.user);
  const { userId, permissions } = user;
  // url路径
  const { pathname } = useLocation();
  // 路由守卫
  useEffect(() => {
    routerGuard(permissions);
  }, [pathname, userId]);
  return (
    <ConfigProvider>
      {userId ? <Container>{children}</Container> : <Login />}
    </ConfigProvider>
  );
}
