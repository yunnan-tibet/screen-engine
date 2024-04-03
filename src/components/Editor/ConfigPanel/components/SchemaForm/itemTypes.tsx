import React from 'react';
import {
  Input as Inp,
  Select as Sele,
  Radio as Rad,
  Checkbox as Checkb,
  DatePicker as DateP,
  InputNumber,
  TreeSelect as TreeS,
  Switch as Swit,
} from 'antd';
import Tree from 'antd/es/tree/Tree';
// import ImageUploader from '../ImageUploader';
import {
  IFormCheckbox,
  IFormDatePicker,
  IFormInput,
  IFormRadio,
  IFormSelect,
  IFormTextArea,
  IFormType,
  ISelectOption,
  IFormInputNumber,
  // IFormUploader,
  IFormTreeSelect,
  IFormRangePicker,
  IFormColor,
  IFormSwitch,
} from './type';
import MyColorPicker from './components/ColorPicker';

export default function getItemComponent(type: IFormType) {
  // input 类型
  const Input = (item: IFormInput) => {
    const { props = {}, label } = item;
    return (
      <Inp {...props} placeholder={props.placeholder || `请输入${label}`} />
    );
  };

  // number 类型
  const Number = (item: IFormInputNumber) => {
    const { props = {}, label } = item;
    return (
      <InputNumber
        {...props}
        placeholder={props.placeholder || `请输入${label}`}
      />
    );
  };

  // select 类型
  const Select = (item: IFormSelect) => {
    const { options, props = {}, label } = item;
    return (
      <Sele placeholder={props.placeholder || `请选择${label}`} {...props}>
        {(options || []).map((option: ISelectOption) => {
          const { label, value } = option;
          return (
            <Sele.Option key={value} value={value}>
              {label}
            </Sele.Option>
          );
        })}
      </Sele>
    );
  };

  // radio类型
  const Radio = (item: IFormRadio) => {
    const { options, props = {} } = item;
    return <Rad.Group options={options} {...props} />;
  };

  // checkbox类型
  const Checkbox = (item: IFormCheckbox) => {
    const { options, props = {} } = item;
    return <Checkb.Group {...props} options={options} />;
  };

  // datepicker类型
  const DatePicker = (item: IFormDatePicker) => {
    const { props = {} } = item;
    return <DateP {...props} />;
  };

  // rangepicker类型
  const RangePicker = (item: IFormRangePicker) => {
    const { props = {} } = item;
    return <DateP.RangePicker {...props} />;
  };

  // textArea类型
  const TextArea = (item: IFormTextArea) => {
    const { props = {}, label } = item;
    return (
      <Inp.TextArea
        {...props}
        placeholder={props.placeholder || `请输入${label}`}
      />
    );
  };
  // upload类型
  // const upload = (item: IFormUploader) => {
  //   const { props = {} } = item;
  //   return <ImageUploader {...props} />;
  // };

  // treeSelect类型
  const TreeSelect = (item: IFormTreeSelect) => {
    const { props = {}, treeData, label } = item;
    return (
      <TreeS
        placeholder={props.placeholder || `请输入${label}`}
        treeData={treeData}
        {...props}
      />
    );
  };

  const Group = () => {
    return <></>;
  };

  const Color = (item: IFormColor) => {
    const { props = {} } = item;
    return <MyColorPicker {...props} />;
  };
  // switch类型
  const Switch = (item: IFormSwitch) => {
    const { props = {} } = item;
    return <Swit {...props} />;
  };
  return {
    Input,
    Select,
    Switch,
    Radio,
    Checkbox,
    DatePicker,
    RangePicker,
    TextArea,
    Number,
    // upload,
    TreeSelect,
    Color,
    Group,
  }[type];
}
