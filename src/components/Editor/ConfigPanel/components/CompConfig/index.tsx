import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';
import { IDATAV } from '@/components/Editor/types';
import SchemaForm from '../SchemaForm';
import { parseConfigToFormSchema } from '@/components/Editor/utils/SchemaTool';
import { ElementInfo } from '@/components/Editor/Viewport/Viewport';

interface IProps {
  editor: Editor;
  info?: ElementInfo;
  configSchema?: IDATAV;
}

const CompConfig = (props: IProps) => {
  const { editor, configSchema, info } = props;
  const { id, dataV } = info || {};
  const { config: configValues } = dataV || {};
  const viewport = editor.getViewport();
  const { desc, version = '1.0.0', config } = configSchema || {};
  const formItems = parseConfigToFormSchema(config);

  const onValuesChange = (changedValues: any, values: any) => {
    id && viewport.updateDataVConfigById(id, values);
  };

  return (
    <div className={styles.compConfig}>
      <div className={styles.tit}>
        <div className={styles.name}>{desc}</div>
        <div className={styles.version}>v{version}</div>
      </div>
      <div className={styles.configWrapper}>
        <SchemaForm
          initialValues={configValues}
          onValuesChange={onValuesChange}
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
