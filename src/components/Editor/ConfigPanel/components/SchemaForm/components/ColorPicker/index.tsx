import React from 'react';
import { Input, ColorPicker } from 'antd';
import styles from './index.less';

interface IProps {
  value?: string;
  onChange?: (v: any) => void;
}

const MyColorPicker = (props: IProps) => {
  const { value = '', onChange } = props;
  return (
    <div className={styles.colorPicker}>
      <Input
        value={value}
        onChange={(e) => {
          onChange && onChange(e.target.value);
        }}
      />
      <ColorPicker
        value={value}
        onChange={(a, v: string) => {
          onChange && onChange(v);
        }}
        style={{ marginLeft: '8px' }}
      />
    </div>
  );
};

export default MyColorPicker;
