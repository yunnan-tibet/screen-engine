import React, { forwardRef } from 'react';
import { Form, Row, Col, FormProps } from 'antd';
import { FormItemInputProps } from 'antd/es/form/FormItemInput';
import { FormItemProps } from 'antd/es/form/FormItem';
import { IFormItem } from './type';
import getItemComponent from './itemTypes';
import styles from './index.less';

export interface ISchemaFormProps extends FormProps {
  // 配置项列表
  formItems: IFormItem[];
}

const SchemaForm = (props: ISchemaFormProps) => {
  const { formItems, ...resProps } = props;

  const getFields = (items?: IFormItem[]) => {
    return items?.map((item) => {
      const { label, id, type, rules, initialValue, render, children } = item;
      const itemProps: FormItemProps = {
        label,
        name: id,
        initialValue,
        rules,
      };

      return type === 'group' ? (
        <Form.Item key={id} label={label}>
          {getFields(children)}
        </Form.Item>
      ) : (
        <Form.Item key={id} {...itemProps}>
          {type ? getItemComponent(type)(item) : render()}
        </Form.Item>
      );
    });
  };

  return (
    <Form className={styles.schemaForm} {...resProps}>
      {getFields(formItems)}
    </Form>
  );
};

export default React.memo(SchemaForm);
