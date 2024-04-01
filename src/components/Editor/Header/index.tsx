import { Button, Space } from 'antd';
import React, { forwardRef } from 'react';
import { history } from 'umi';
import Editor from '../Editor';
import { prefix } from '../utils/utils';
import './index.less';

interface IProps {
  editor: Editor;
}

export interface IHeaderRef {}

const Header = forwardRef<IHeaderRef, IProps>((props, ref) => {
  const { editor } = props;
  const save = () => editor.saveAll();
  return (
    <div className={prefix('header')}>
      <Space>
        <Button size="small" onClick={() => editor.saveAll()}>
          保存
        </Button>
        <Button
          onClick={() => {
            save();
            window.open('#/template/one');
          }}
          size="small"
          type="primary"
        >
          预览
        </Button>
      </Space>
    </div>
  );
});

export default Header;
