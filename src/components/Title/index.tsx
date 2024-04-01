import React from 'react';
import styles from './index.css';

interface ITitleProps {
  // 标题
  title: string;
}

export default function Title(props: ITitleProps) {
  const { title } = props;
  return <div className={styles.title}>{title}</div>;
}
