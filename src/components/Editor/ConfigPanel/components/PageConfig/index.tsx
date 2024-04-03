import React from 'react';
import Editor from '@/components/Editor/Editor';
import styles from './index.less';

interface IProps {
  editor: Editor;
}

const PageConfig = (props: IProps) => {
  const { editor } = props;
  return <div className={styles.pageConfig}>PageConfig</div>;
};

export default PageConfig;
