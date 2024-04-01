import React, { useEffect, useState } from 'react';
import { ConfigProvider, Image, Dropdown, Menu } from 'antd';
import { IUserState, useLocation, useSelector, useDispatch } from 'umi';
import BasicLayout, { MenuDataItem } from '@ant-design/pro-layout';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Route } from '@ant-design/pro-layout/lib/typings';
import logo from '@/assets/img/logo.jpg';
import styles from './index.less';
import { menu, PERMISSIONS } from '@/constants';
import { IAppState } from '@/models';

interface IProps {
  children: JSX.Element;
}

export default function Container({ children }: IProps) {
  // url路径
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [parentMenuName, setParentMenuName] = useState('');
  const dispatch = useDispatch();
  const user: IUserState = useSelector((state: IAppState) => state.user);
  const { permissions, userId, userName } = user;
  // side menu的路径切换监听父级名称改变
  useEffect(() => {
    setParentMenuName(getParentMenuName(getMenu().routes || [], ''));
  }, [pathname, userId]);

  const getMenu = () => {
    const getRoutes = (_routes: Route[]) => {
      const arr = [];
      for (let i = 0; i < _routes.length; i++) {
        const item = _routes[i];
        const { somePermissions, routes } = item;
        if (PERMISSIONS.somePermissionAllow(somePermissions, permissions)) {
          item.routes = getRoutes(routes || []);
          arr.push(_routes[i]);
        }
      }
      return arr;
    };
    return { routes: getRoutes(menu.routes || []) };
  };

  // 获取父级名称
  const getParentMenuName = (routes: MenuDataItem[], parentName: string) => {
    let pMName = '';
    routes.forEach((item: MenuDataItem) => {
      const { path: _path = '', name = '', routes: _routes } = item;
      if (parentName && pathname.includes(_path)) {
        pMName = parentName;
      }
      if (_routes && _routes.length) {
        pMName = pMName || getParentMenuName(_routes, name);
      }
    });
    return pMName;
  };

  // logo
  const getLogo = () =>
    !collapsed && <Image preview={false} className={styles.logo} src={logo} />;

  // 用户信息菜单栏
  const getRightContentRender: any = () => (
    <Dropdown overlay={avaterMenu}>
      <div>
        {/* <Image preview={false} src="www.baidu.com" /> */}
        <span>{userName}</span>
      </div>
    </Dropdown>
  );

  const avaterMenu = (
    <Menu>
      <Menu.Item>
        <a
          onClick={() => {
            dispatch({
              type: 'user/logout',
              payload: {
                userId,
              },
            });
          }}
        >
          退出
        </a>
      </Menu.Item>
    </Menu>
  );

  // 菜单栏
  const menuItemRender = (item: MenuDataItem, dom: React.ReactNode) => {
    const { path: _path } = item;
    return (
      <a
        onClick={() => {
          window.location.hash = _path || '';
        }}
      >
        {dom}
      </a>
    );
  };

  // head左侧内容设置
  const headerContentRender = () => (
    <>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'inline-block',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <span style={{ paddingLeft: '16px' }}>{parentMenuName}</span>
    </>
  );

  return (
    <ConfigProvider>
      {/* <BasicLayout
        // logo={getLogo()}
        location={{
          pathname,
        }}
        contentStyle={{ margin: '0px' }}
        collapsed={collapsed}
        collapsedButtonRender={false}
        headerContentRender={headerContentRender}
        menuItemRender={menuItemRender}
        rightContentRender={getRightContentRender}
        breadcrumbRender={(route) => route}
        title=""
        className={styles.layout}
        navTheme="light"
        route={getMenu()}
      > */}
      {children}
      {/* </BasicLayout> */}
    </ConfigProvider>
  );
}
