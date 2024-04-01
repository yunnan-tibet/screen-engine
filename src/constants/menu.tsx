import { Route } from '@ant-design/pro-layout/lib/typings';
import { DashboardOutlined } from '@ant-design/icons';
import React from 'react';

export const PERMISSIONS = {
  TEMPLATE_ONE: 'template_one',
  TEMPLATE_TWO: 'template_two',
  somePermissionAllow: (
    allowPermissions: string[] = [],
    ownerPermissions: string[] = [],
  ) =>
    !allowPermissions.length ||
    ownerPermissions.some((perm) => allowPermissions.includes(perm)),
};

export const menu: Route = {
  routes: [
    {
      icon: <DashboardOutlined />,
      name: '模版页面',
      somePermissions: [PERMISSIONS.TEMPLATE_ONE, PERMISSIONS.TEMPLATE_TWO],
      routes: [
        {
          name: '模版子页面1',
          exact: true,
          path: '/template/one',
          somePermissions: [PERMISSIONS.TEMPLATE_ONE],
        },
        {
          name: '模版子页面2',
          exact: true,
          path: '/template/two',
          somePermissions: [PERMISSIONS.TEMPLATE_TWO],
        },
      ],
    },
  ],
};
