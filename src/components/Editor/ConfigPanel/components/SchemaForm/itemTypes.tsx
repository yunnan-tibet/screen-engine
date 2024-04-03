import React from 'react';
import {
  Input,
  Select,
  Radio,
  Checkbox,
  DatePicker,
  InputNumber,
  TreeSelect,
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
} from './type';

export default function getItemComponent(type: IFormType) {
  // input 类型
  const input = (item: IFormInput) => {
    const { props = {} } = item;
    return (
      <Input
        {...props}
        placeholder={props.placeholder || `请输入${item.label}`}
      />
    );
  };

  // inputNumber 类型
  const inputNumber = (item: IFormInputNumber) => {
    const { props = {} } = item;
    return (
      <InputNumber
        {...props}
        placeholder={props.placeholder || `请输入${item.label}`}
      />
    );
  };

  // select 类型
  const select = (item: IFormSelect) => {
    const { options, props = {} } = item;
    return (
      <Select
        placeholder={props.placeholder || `请选择${item.label}`}
        {...props}
      >
        {(options || []).map((option: ISelectOption) => {
          const { label, value } = option;
          return (
            <Select.Option key={value} value={value}>
              {label}
            </Select.Option>
          );
        })}
      </Select>
    );
  };

  // radio类型
  const radio = (item: IFormRadio) => {
    const { options, props = {} } = item;
    return <Radio.Group options={options} {...props} />;
  };

  // checkbox类型
  const checkbox = (item: IFormCheckbox) => {
    const { options, props = {} } = item;
    return <Checkbox.Group {...props} options={options} />;
  };

  // datepicker类型
  const datePicker = (item: IFormDatePicker) => {
    const { props = {} } = item;
    return <DatePicker {...props} />;
  };

  // rangepicker类型
  const rangePicker = (item: IFormRangePicker) => {
    const { props = {} } = item;
    return <DatePicker.RangePicker {...props} />;
  };

  // textArea类型
  const textArea = (item: IFormTextArea) => {
    const { props = {} } = item;
    return (
      <Input.TextArea
        {...props}
        placeholder={props.placeholder || `请输入${item.label}`}
      />
    );
  };
  // upload类型
  // const upload = (item: IFormUploader) => {
  //   const { props = {} } = item;
  //   return <ImageUploader {...props} />;
  // };

  // treeSelect类型
  const treeSelect = (item: IFormTreeSelect) => {
    const { props = {}, treeData } = item;
    return (
      <TreeSelect
        placeholder={props.placeholder || `请输入${item.label}`}
        treeData={treeData}
        {...props}
      />
    );
  };

  const group = () => {
    return <></>;
  };
  return {
    input,
    select,
    radio,
    checkbox,
    datePicker,
    rangePicker,
    textArea,
    inputNumber,
    // upload,
    treeSelect,
    group,
  }[type];
}
