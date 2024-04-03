import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';

interface IProps {
  editor: Editor;
}

const MultConfig = (props: IProps) => {
  const { editor } = props;
  return <div className={styles.multConfig}>MultConfig</div>;
};

export default MultConfig;
