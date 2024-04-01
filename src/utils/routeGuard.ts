import { menu, PERMISSIONS } from '@/constants';

/**
 * 判断跳转
 * @param permissionList 我的权限列表
 */
export const routerGuard = (permissionList: string[], errCb?: any) => {
  const urlHashRoute = window.location.hash.replace('#', '');
  let jumpRoute = '/login';
  const permissionedRoutes: any[] = [];
  const findJumpRoute = (_menuConfig: any) => {
    _menuConfig.forEach((_menu: any) => {
      if (
        PERMISSIONS.somePermissionAllow(_menu.somePermissions, permissionList)
      ) {
        if (_menu.routes && _menu.routes.length) {
          findJumpRoute(_menu.routes);
        } else {
          permissionedRoutes.push(_menu.path);
        }
      }
    });
  };
  findJumpRoute(menu.routes);
  if (permissionedRoutes.length) {
    if (urlHashRoute && urlHashRoute !== '/login') {
      jumpRoute = urlHashRoute;
    } else {
      jumpRoute = permissionedRoutes[0];
    }
  } else {
    errCb && errCb();
  }
  window.location.hash = jumpRoute;
};
