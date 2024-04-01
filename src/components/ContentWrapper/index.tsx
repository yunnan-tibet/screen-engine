import React from 'react';
import Title from '../Title';
import styles from './index.css';

interface IContentWrapperProps extends IBaseWrapperProps {
  children?: any;
  // 标题
  title?: string;
}

export default function ContentWrapper(props: IContentWrapperProps) {
  const { children, title, className } = props;
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {title && <Title title={title} />}
      {children}
    </div>
  );
}
