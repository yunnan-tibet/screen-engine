import React, { forwardRef } from 'react';
import Editor from '../Editor';
import { MENU_TYPE } from '../RightClickMenu/config';
import { IDATAV } from '../types';
import { prefix } from '../utils/utils';
import CompConfig from './components/CompConfig';
import GroupConfig from './components/GroupConfig';
import MultConfig from './components/MultConfig';
import PageConfig from './components/PageConfig';
import './index.less';

interface IProps {
  editor: Editor;
}

export interface IConfigPanelRef {}

const ConfigPanel = forwardRef<IConfigPanelRef, IProps>((props, ref) => {
  const { editor } = props;
  const {
    state: {
      resources: { schema },
    },
  } = editor;

  const getSelectedInfoAndType = () => {
    const viewport = editor.getViewport();
    const selectedTargets = editor.getSelectedTargets();
    const len = selectedTargets.length;
    let type;
    let config: IDATAV | undefined;
    if (!len) {
      // 未选中的情况设置画布
      type = MENU_TYPE.VIEWPORT;
    } else if (len === 1) {
      // 选中单个情况
      const info = viewport.getInfoByElement(selectedTargets[0]);
      if (!info.children || !info.children.length) {
        // 不是组
        type = MENU_TYPE.SINGLE_ELE;
        config = schema[info.name];
      } else {
        // 是组
        type = MENU_TYPE.GROUP;
      }
    } else {
      // 选中多个的情况
      type = MENU_TYPE.MULT_ELE;
    }
    return { type, config };
  };

  const { type, config } = getSelectedInfoAndType();

  const renderPanel = (_type: number) => {
    switch (_type) {
      case MENU_TYPE.SINGLE_ELE:
        return <CompConfig editor={editor} configSchema={config} />;
      case MENU_TYPE.VIEWPORT:
        return <PageConfig editor={editor} />;
      case MENU_TYPE.MULT_ELE:
        return <MultConfig editor={editor} />;
      case MENU_TYPE.GROUP:
        return <GroupConfig editor={editor} />;
      default:
        return '';
    }
  };

  return <div className={prefix('config-panel')}>{renderPanel(type)}</div>;
});

export default ConfigPanel;
