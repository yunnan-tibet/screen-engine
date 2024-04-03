import { IObject } from '@daybrush/utils';
import _ from 'lodash';
import { IFormItem } from '../ConfigPanel/components/SchemaForm/type';

// 将组件配置解析为表单json
export const parseConfigToFormSchema = (config?: IObject<any>): IFormItem[] => {
  if (!config) {
    return [];
  }
  const _config = _.cloneDeep(config);
  const loop = (obj: IObject<any>): IFormItem[] => {
    return Object.keys(obj).map((key) => {
      const item = obj[key];
      const { type, children, defaultValue, name } = item || {};
      if (type === 'Group' && children) {
        item.children = loop(children);
      }
      return {
        ...item,
        id: key,
        label: name,
        type,
        initialValue: defaultValue,
      };
    });
  };
  return loop(_config);
};
