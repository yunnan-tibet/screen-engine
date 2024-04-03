import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';
import { IDATAV } from '@/components/Editor/types';
import SchemaForm from '../SchemaForm';

interface IProps {
  editor: Editor;
  configSchema?: IDATAV;
}

const CompConfig = (props: IProps) => {
  const { editor, configSchema } = props;
  const { desc, version = '1.0.0', config } = configSchema || {};
  return (
    <div className={styles.compConfig}>
      <div className={styles.tit}>
        <div className={styles.name}>{desc}</div>
        <div className={styles.version}>v{version}</div>
      </div>
      <div className={styles.configWrapper}>
        <SchemaForm
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign="left"
          formItems={[
            {
              id: 'text',
              label: '文本内容',
              type: 'input',
              initialValue: '我是标题',
            },
            {
              id: 'fontSize',
              label: '字号',
              type: 'inputNumber',
              initialValue: 24,
            },
            // {
            //   id: 'color',
            //   label: '字号',
            //   type: 'color',
            //   initialValue: '#fff',
            // },
            {
              id: 'fontWeight',
              label: '字体粗细',
              type: 'select',
              options: [
                {
                  label: 'Normal',
                  value: 'normal',
                },
                {
                  label: 'Bold',
                  value: 'bold',
                },
                {
                  label: 'Bolder',
                  value: 'bolder',
                },
                {
                  label: 'Lighter',
                  value: 'lighter',
                },
                {
                  label: '100',
                  value: '100',
                },
                {
                  label: '200',
                  value: '200',
                },
                {
                  label: '300',
                  value: '300',
                },
                {
                  label: '400',
                  value: '400',
                },
                {
                  label: '500',
                  value: '500',
                },
                {
                  label: '600',
                  value: '600',
                },
                {
                  label: '700',
                  value: '700',
                },
                {
                  label: '800',
                  value: '800',
                },
                {
                  label: '900',
                  value: '900',
                },
              ],
              initialValue: 'normal',
            },
            {
              id: 'textAlign',
              label: '对齐方式',
              type: 'group',
              children: [
                {
                  id: 'horizontal',
                  label: '水平',
                  type: 'select',
                  options: [
                    {
                      label: '左对齐',
                      value: 'left',
                    },
                    {
                      label: '右对齐',
                      value: 'right',
                    },
                    {
                      label: '居中对齐',
                      value: 'center',
                    },
                  ],
                  initialValue: 'center',
                },
                {
                  id: 'vertical',
                  label: '垂直',
                  type: 'select',
                  options: [
                    {
                      label: '顶部对齐',
                      value: 'top',
                    },
                    {
                      label: '底部对齐',
                      value: 'bottom',
                    },
                    {
                      label: '居中对齐',
                      value: 'center',
                    },
                  ],
                  initialValue: 'center',
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CompConfig;
