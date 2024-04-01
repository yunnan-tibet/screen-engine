### 适用范围
react后台管理端，采用umi框架作为基础，添加了lint规则进行自动化fix，ts，菜单权限能力，路由守卫能力，优化了mock方式，请求方式同步化。

### tips
- 使用请安装vscode插件：eslint和stylelint
- 注意语义化，注意类别区分
- 引入使用@/ 代替 src/

### 开始
npm i

npm run start 本地开发

npm run build 构建dist包

### 主要目录
- mock 用于本地开发mock数据
- src 
  - assets 静态文件层
  - components 基础组件层
  - constants 常量层
    - menu 菜单 + 菜单权限配置
  - layouts 容器层
    - container 页面layout
    - login 登陆页面
  - models 状态管理层
  - pages 页面层
  - service 服务层
  - typings 类型定义层
  - utils 工具层
  - styles 全局样式
- gloabl.less 全局样式入口
- app.js 运行时umi配置入口
- .umirc.ts 基本配置
- .umirc.dev.ts   npm run start 用的配置
- .umirc.prod.ts   npm run build 用的配置

### pages
页面创建规则与umi的一致，页面路径与route路径一致

### service
每个模块在service下建一个模块service文件，然后在index中导出
，example:
```
export function getLoginUserInfo() {
  return request.get({
    url: `${USER_API}/sys/authority/getLoginUser`,
  });
}

const [err, data] = await UserService.getLoginUserInfo();
if (!err) {
  setData(data);
}
```

### constants
所有常量都请定义在这里，每个模块的常量都要在constants下新建一个文件，example：
```
// 预警时间类型
// 类型常量定义推荐，这种形式使用起来特别方便
export const WARNING_TIME_TYPE = {
  WEEK: 2, // 近一周
  TODAY: 1, // 今日
  VALUES: [2, 1],
  toString: (v: number) => {
    switch (v) {
      case WARNING_TIME_TYPE.WEEK:
        return '近一周';
      case WARNING_TIME_TYPE.TODAY:
        return '今日';
      default:
        return '未知';
    }
  },
};
```

### mock
每个模块可以在mock文件夹下定义一个文件，在api.ts中引入

### models
用于状态管理，如果不是必要的存储，不要把逻辑加到这里去，便于维护

### typings
每个模块的类型定义在typings下新建一个xx.d.ts文件，不需要export和import

### 正在开发
- 各类脚手架
- [react admin组件库](https://www.npmjs.com/package/@szsk/rac)
- [utils库](https://www.npmjs.com/package/@szsk/utils)

### 有问题请联系我
陈强华 15958033902 qhchen@secusoft.cc
