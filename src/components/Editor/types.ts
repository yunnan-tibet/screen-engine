import { IObject } from '@daybrush/utils';
import * as React from 'react';
import Memory from './utils/Memory';
import EventBus from './utils/EventBus';
import MoveableData from './utils/MoveableData';
import MoveableManager from './Viewport/MoveableMananger';
import KeyManager from './KeyManager/KeyManager';
import Editor from './Editor';
import HistoryManager from './utils/HistoryManager';
import Debugger from './utils/Debugger';

export interface ScenaEditorState {
  selectedTargets: Array<SVGElement | HTMLElement>;
  horizontalGuides: number[];
  verticalGuides: number[];
  selectedMenu: string;
  zoom: number;
  resources: IResources;
}

export interface IResources {
  schema: IObject<any>;
  source: IObject<any>;
}

export interface TagAppendInfo {
  tag: any;
  props: IObject<any>;
  name: string;
  frame: IObject<any>;
}

export interface EditorInterface {
  editor: Editor;
  memory: Memory;
  eventBus: EventBus;
  moveableData: MoveableData;
  keyManager: KeyManager;
  historyManager: HistoryManager;
  console: Debugger;
  moveableManager: React.RefObject<MoveableManager>;
}

export interface Clipboard {
  write(items: ClipboardItem[]): Promise<void>;
}
export interface ClipboardItem {
  types: string[];
  getType(type: string): Promise<Blob>;
}

export interface SavedScenaData {
  name: string;
  jsxId?: string;
  componentId?: string;
  tagName: string;
  innerHTML?: string;
  innerText?: string;
  attrs: IObject<any>;
  frame: IObject<any>;
  source: IObject<any>; // 配置项的数据
  children: SavedScenaData[];
}
export interface ScenaProps {
  scenaElementId?: string;
  scenaAttrs?: IObject<any>;
  scenaText?: string;
  scneaHTML?: string;
}

export type ScenaFunctionComponent<T> = ((
  props: T & ScenaProps,
) => React.ReactElement<any, any>) & { scenaComponentId: string };
export type ScenaComponent = React.JSXElementConstructor<ScenaProps> & {
  scenaComponentId: string;
};
export type ScenaJSXElement =
  | React.ReactElement<any, string>
  | ScenaFunctionJSXElement;
export type ScenaFunctionJSXElement = React.ReactElement<any, ScenaComponent>;
export type ScenaJSXType = ScenaJSXElement | string | ScenaComponent;
export interface CompConfig<T> {
  source?: any[];
  config: T;
}

// datav配置文件格式
export interface IDATAV {
  name: string; // 组件key
  desc: string; // 组件名称
  version: string; // 组件版本
  config: IObject<any>; // 配置项
}
