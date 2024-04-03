import { InputProps, TextAreaProps } from 'antd/lib/input';
import { SelectProps } from 'antd/lib/select';
import { RadioGroupProps } from 'antd/lib/radio';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker';
import { Rule } from 'antd/lib/form';
import {
  InputNumberProps,
  SwitchProps,
  TreeProps,
  TreeSelectProps,
} from 'antd';
// import { IUploderProps } from '../ImageUploader';

// 基础类型
export type IFormItem = IFormInput &
  IFormSelect &
  IFormRadio &
  IFormDatePicker &
  IFormRangePicker &
  IFormCheckbox &
  IFormTextArea &
  // | IFormUploader
  IFormTreeSelect &
  IFormSwitch &
  IFormColor &
  IFormGroup;

export type IFormType =
  | 'Input'
  | 'Number'
  | 'Select'
  | 'Switch'
  | 'Radio'
  | 'DatePicker'
  | 'RangePicker'
  | 'Checkbox'
  | 'TextArea'
  // | 'upload'
  | 'TreeSelect'
  | 'Color'
  | 'Group';

export interface IFormItemBase {
  // 输出属性key，id
  id: string;
  // 显示名称
  label: string;
  // 可选表单类型
  type?: IFormType;
  // 自定义组件
  render?: any;
  // 初始值
  initialValue?: any;
  // 规则
  rules?: Rule[];
}

export interface IFormGroup extends IFormItemBase {
  children?: IFormItem[];
}

export interface IFormInput extends IFormItemBase {
  props?: InputProps;
}

export interface IFormInputNumber extends IFormItemBase {
  props?: InputNumberProps;
}

export interface IFormTextArea extends IFormItemBase {
  props?: TextAreaProps;
}

// export interface IFormUploader extends IFormItemBase {
//   props?: IUploderProps;
// }

export interface IFormSwitch extends IFormItemBase {
  props?: SwitchProps;
}

export interface IFormColor extends IFormItemBase {
  props?: any;
}

export interface IFormTreeSelect extends IFormItemBase {
  props?: TreeSelectProps;
  treeData?: any[];
}

export interface IFormSelect extends IFormItemBase {
  props?: SelectProps<any>;
  // 可选列表
  options?: ISelectOption[];
}

export interface ISelectOption {
  label: string;
  value: any;
}

export interface IFormRadio extends IFormItemBase {
  props?: RadioGroupProps;
  // 可选列表
  options?: ISelectOption[];
}

export interface IFormDatePicker extends IFormItemBase {
  props?: DatePickerProps;
}

export interface IFormRangePicker extends IFormItemBase {
  props?: RangePickerProps;
}

export interface IFormCheckbox extends IFormItemBase {
  props?: CheckboxGroupProps;
  // 可选列表
  options?: ISelectOption[];
}
