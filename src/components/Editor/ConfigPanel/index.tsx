import React, { forwardRef } from 'react';
import Editor from '../Editor';
import { prefix } from '../utils/utils';
import './index.less';

interface IProps {
  editor: Editor;
}

export interface IConfigPanelRef {}

const ConfigPanel = forwardRef<IConfigPanelRef, IProps>((props, ref) => {
  return (
    <div className={prefix('config-panel')}>
      <div className={prefix('config-panel-title')}>Title</div>
      <div className={prefix('config-panel-attrs')}>Attrs</div>
    </div>
  );
});

export default ConfigPanel;
