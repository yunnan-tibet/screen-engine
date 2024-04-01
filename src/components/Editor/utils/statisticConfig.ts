export const getResources = (context: __WebpackModuleApi.RequireContext) => {
  const components: any = {};

  context.keys().forEach((key: string) => {
    const result = /^\.\/(.+)\/(.+)\.((j|t)sx|json)?$/.exec(key);
    const name = Array.isArray(result) ? result[1] : null;
    if (!name) {
      return;
    }
    components[name] = {
      ...(components[name] || { pkgJson: {}, element: () => '' }),
      [key.endsWith('package.json') ? 'pkgJson' : 'element']: key.endsWith(
        'package.json',
      )
        ? context(key)
        : context(key).default,
    };
  });

  return getSchemaAndSrcConfig(components);
};

export const getSchemaAndSrcConfig = (blocks: any = {}) => {
  const schema: any = {};
  const src: any = {};
  Object.values(blocks).forEach(({ element, pkgJson }) => {
    const { name } = pkgJson;
    schema[name] = pkgJson;
    src[name] = element;
  });
  return {
    schema,
    src,
  };
};

export const findCompId = (ele: HTMLDivElement) => {
  const loop = (_ele: HTMLDivElement): string => {
    return _ele?.getAttribute('componentid') ?? loop(_ele.parentElement);
  };
  return loop(ele);
};

export const findCompEle = (ele: HTMLDivElement) => {
  const loop = (_ele: HTMLDivElement): HTMLDivElement | undefined => {
    const cId = _ele?.getAttribute('componentid');
    if (cId) {
      return _ele;
    }
    if (_ele.parentElement) {
      return loop(_ele.parentElement);
    }
  };
  return loop(ele);
};

// 用于布局组件找位置idx，仅在grid-col才能放入
export const findGridIndex = (ele: HTMLDivElement) => {
  let _ele = ele;
  if (!_ele || !(_ele.getAttribute('data-type') === 'grid-col')) {
    return;
  }
  _ele = _ele.parentNode;
  _ele = _ele.previousElementSibling;
  let i = 0;
  // 往左找的指针，i++的位置
  while (_ele) {
    _ele = _ele.previousElementSibling;
    i++;
  }
  return i;
};

// 浅拷贝
export const findSingle = (tree: any, key: string, value: any) => {
  let myItem;
  const loop = (_tree: any) => {
    const { children } = _tree;
    if (_tree[key] !== value) {
      if (children && children.length) {
        children.forEach((item: any) => {
          item && loop(item);
        });
      }
    } else {
      myItem = _tree;
    }
  };

  loop(tree);
  return myItem;
};

// 树形删除单个
export const delSingle = (tree: any, key: string, value: any) => {
  if (tree[key] === value) {
    // 删除了本身？
    return {};
  }
  if (!tree.children || !tree.children.length) {
    // 没有子元素了
    return tree;
  }

  const loop = (list: any) => {
    const _list: any[] = [];
    list.forEach((item: any, idx: number) => {
      const _item = { ...(item || {}) };
      const { children } = _item;
      if (_item[key] !== value) {
        if (children && children.length) {
          _item.children = loop(children) || [];
        }
        _list[idx] = _item;
      }
    });
    return _list;
  };

  return { ...tree, children: loop(tree.children) || [] };
};

export const isGridComp = (name: string) => {
  return ['ThreeLine', 'ThreeColumn', 'TwoColumn', 'TwoLine'].includes(name);
};
