import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';
import { IDATAV } from '@/components/Editor/types';
import SchemaForm from '../SchemaForm';
import { parseConfigToFormSchema } from '@/components/Editor/utils/SchemaTool';

interface IProps {
  editor: Editor;
  configSchema?: IDATAV;
}

const CompConfig = (props: IProps) => {
  const { editor, configSchema } = props;
  const { desc, version = '1.0.0', config } = configSchema || {};
  const formItems = parseConfigToFormSchema(config);
  console.log(formItems, 'formItems');

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
          formItems={formItems}
        />
      </div>
    </div>
  );
};

export default CompConfig;
