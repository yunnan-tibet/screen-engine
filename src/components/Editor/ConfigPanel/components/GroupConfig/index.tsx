import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';

interface IProps {
  editor: Editor;
}

const GroupConfig = (props: IProps) => {
  const { editor } = props;
  return <div className={styles.groupConfig}>GroupConfig</div>;
};

export default GroupConfig;
