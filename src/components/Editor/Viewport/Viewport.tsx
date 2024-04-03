import * as React from 'react';
import { IObject, isString, isArray } from '@daybrush/utils';
import {
  prefix,
  getId,
  getScenaAttrs,
  isScenaFunction,
  isScenaElement,
  isNumber,
  isScenaFunctionElement,
} from '../utils/utils';
import { DATA_SCENA_ELEMENT_ID } from '../consts';
import { ScenaJSXElement, ScenaComponent, ScenaJSXType } from '../types';

export interface AddedInfo {
  added: ElementInfo[];
}
export interface RemovedInfo {
  removed: ElementInfo[];
}
export interface MovedInfo {
  info: ElementInfo;
  parentInfo: ElementInfo;
  prevInfo?: ElementInfo;
}
export interface MovedResult {
  moved: ElementInfo[];
  prevInfos: MovedInfo[];
  nextInfos: MovedInfo[];
}
export interface ElementInfo {
  jsx: ScenaJSXType;
  name: string;
  frame?: IObject<any>;
  dataV: IDataV;

  scopeId?: string; // 父级id
  children?: ElementInfo[];
  attrs?: IObject<any>;
  componentId?: string;
  jsxId?: string;
  el?: HTMLElement | null;
  id?: string;
  index?: number;
  innerText?: string;
  innerHTML?: string;
}

export interface IDataV {
  config: IObject<any>;
  source: any[];
}
export default class Viewport extends React.PureComponent<{
  style: IObject<any>;
  onBlur: (e: any) => any;
}> {
  public components: IObject<ScenaComponent> = {};

  public jsxs: IObject<ScenaJSXElement> = {};

  public viewport: ElementInfo = {
    jsx: <div />,
    name: 'Viewport',
    id: 'viewport',
    children: [],
    dataV: {
      config: {},
      source: [],
    },
  };

  public ids: IObject<ElementInfo> = {
    viewport: this.viewport,
  };

  public state = {};

  public viewportRef = React.createRef<HTMLDivElement>();

  public render() {
    const style = this.props.style;

    return (
      <div
        className={prefix('viewport-container')}
        onBlur={this.props.onBlur}
        style={style}
      >
        {this.props.children}
        <div
          className={prefix('viewport')}
          {...{ [DATA_SCENA_ELEMENT_ID]: 'viewport' }}
          ref={this.viewportRef}
        >
          {this.renderChildren(this.getViewportInfos())}
        </div>
      </div>
    );
  }

  public componentDidMount() {
    this.ids.viewport.el = this.viewportRef.current!;
  }

  public renderChildren(children: ElementInfo[]): ScenaJSXElement[] {
    return children.map((info, idx: number) => {
      const jsx = info.jsx;
      const nextChildren = info.children!;
      const renderedChildren = this.renderChildren(nextChildren);
      const id = info.id!;
      const props: IObject<any> = {
        key: id,
      };

      if (isString(jsx)) {
        props[DATA_SCENA_ELEMENT_ID] = id;
        return React.createElement(
          jsx,
          props,
          ...renderedChildren,
        ) as ScenaJSXElement;
      }
      if (isScenaFunction(jsx)) {
        props.scenaElementId = id;
        props.scenaAttrs = info.attrs || {};
        props.scenaText = info.innerText;
        props.scenaHTML = info.innerHTML;
        return React.createElement(jsx, props) as ScenaJSXElement;
      }
      if (isString(jsx.type)) {
        props[DATA_SCENA_ELEMENT_ID] = id;
      } else {
        props.scenaElementId = id;
        props.scenaAttrs = info.attrs || {};
        props.scenaText = info.innerText;
        props.scenaHTML = info.innerHTML;
        props.config = info.dataV.config;
        props.source = info.dataV.source;
      }
      console.log(props, 'propsprops');

      const jsxChildren = jsx.props.children;
      return React.cloneElement(
        jsx,
        { ...jsx.props, ...props },
        ...(isArray(jsxChildren) ? jsxChildren : [jsxChildren]),
        ...this.renderChildren(nextChildren),
      ) as ScenaJSXElement;
    });
  }

  // 获取存储的jsx
  public getJSX(id: string) {
    return this.jsxs[id];
  }

  // 获取存储的对象方法
  public getComponent(id: string) {
    return this.components[id];
  }

  // 唯一id
  public makeId(ids: IObject<any> = this.ids) {
    while (true) {
      const id = `scena${Math.floor(Math.random() * 100000000)}`;

      if (ids[id]) {
        continue;
      }
      return id;
    }
  }

  // 设置id对应整体info
  public setInfo(id: string, info: ElementInfo) {
    const ids = this.ids;

    ids[id] = info;
  }

  // 设置id获取对应整体info
  public getInfo(id: string) {
    return this.ids[id];
  }

  // 根据id获取最后一个子元素信息
  public getLastChildInfo(id: string) {
    const info = this.getInfo(id);
    const children = info.children!;

    return children[children.length - 1];
  }

  // 获取下一个元素信息
  public getNextInfo(id: string) {
    const info = this.getInfo(id);
    const parentInfo = this.getInfo(info.scopeId!)!;
    const parentChildren = parentInfo.children!;
    const index = parentChildren.indexOf(info);

    return parentChildren[index + 1];
  }

  // 获取上一个元素信息
  public getPrevInfo(id: string) {
    const info = this.getInfo(id);
    const parentInfo = this.getInfo(info.scopeId!)!;
    const parentChildren = parentInfo.children!;
    const index = parentChildren.indexOf(info);

    return parentChildren[index - 1];
  }

  // 通过元素获取元素信息
  public getInfoByElement(el: HTMLElement | SVGElement) {
    return this.ids[getId(el)];
  }

  // 通过idx位置获取信息列表
  public getInfoByIndexes(indexes: number[]) {
    return indexes.reduce((info: ElementInfo, index: number) => {
      return info.children![index];
    }, this.viewport);
  }

  // 根据id获取元素
  public getElement(id: string) {
    const info = this.getInfo(id);

    return info ? info.el : null;
  }

  // 获取所有元素列表，除了容器
  public getViewportInfos() {
    return this.viewport.children!;
  }

  // 获取元素所在的链idx，从底部开始
  public getIndexes(target: HTMLElement | SVGElement | string): number[] {
    const info = (
      isString(target) ? this.getInfo(target) : this.getInfoByElement(target)
    )!;

    if (!info.scopeId) {
      return [];
    }
    const parentInfo = this.getInfo(info.scopeId)!;

    return [
      ...this.getIndexes(info.scopeId),
      parentInfo.children!.indexOf(info),
    ];
  }

  // 注册info，正式创建info结构
  public registerChildren(jsxs: ElementInfo[], parentScopeId?: string) {
    return jsxs.map((info) => {
      const id = info.id || this.makeId();
      const jsx = info.jsx;
      const children = info.children || [];
      const scopeId = parentScopeId || info.scopeId || 'viewport';
      let componentId = '';
      let jsxId = '';

      // 是元素实例？
      if (isScenaElement(jsx)) {
        jsxId = this.makeId(this.jsxs);
        this.jsxs[jsxId] = jsx;
        const component = jsx.type;
        componentId = component.scenaComponentId;
        this.components[componentId] = component;
      }
      const elementInfo: ElementInfo = {
        ...info,
        jsx,
        dataV: {
          config: {},
          source: [],
        },
        children: this.registerChildren(children, id),
        scopeId,
        componentId,
        jsxId,
        frame: info.frame || {},
        el: null,
        id,
      };
      this.setInfo(id, elementInfo);
      return elementInfo;
    });
  }

  public updateDataVConfigById(id: string, values: IObject<any>) {
    const dataV = this.getInfo(id).dataV;
    dataV.config = values;
    this.forceUpdate();
  }

  // 加入新元素
  public appendJSXs(
    jsxs: ElementInfo[],
    appendIndex: number,
    scopeId?: string,
  ): Promise<AddedInfo> {
    // 注册创建infos结构，加入到ids[]，并返回infos
    const jsxInfos = this.registerChildren(jsxs, scopeId);

    jsxInfos.forEach((info, i) => {
      // 获取父级信息
      const scopeInfo = this.getInfo(scopeId || info.scopeId!);
      const children = scopeInfo.children!;
      if (appendIndex > -1) {
        // 加入位置是正常的
        children.splice(appendIndex + i, 0, info);
        info.index = appendIndex + i;
      } else if (isNumber(info.index)) {
        // 已经有加入位置了，应该是复edit的
        children.splice(info.index, 0, info);
      } else {
        // 完全没有设置，应该是初始加入的
        info.index = children.length;
        children.push(info);
      }
    });

    return new Promise((resolve) => {
      this.forceUpdate(() => {
        const infos = jsxInfos.map(function registerElement(info) {
          const id = info.id!;
          // 重新渲染后去设置元素的attrs
          const target = document.querySelector<HTMLElement>(
            `[${DATA_SCENA_ELEMENT_ID}="${id}"]`,
          )!;
          const attrs = info.attrs || {};
          for (const name in attrs) {
            target.setAttribute(name, attrs[name]);
          }
          info.attrs = getScenaAttrs(target);
          // 设置ele
          info.el = target;

          const children = info.children || [];

          if (children.length) {
            // 有子元素则继续遍历
            children.forEach(registerElement);
          } else if (info.attrs!.contenteditable) {
            // 是可编辑的，则优先设置上innerText
            if ('innerText' in info) {
              (target as HTMLElement).innerText = info.innerText || '';
            } else {
              info.innerText = (target as HTMLElement).innerText || '';
            }
          } else if (!info.componentId) {
            // 不是组件，则优先设置innerHTML
            if ('innerHTML' in info) {
              target.innerHTML = info.innerHTML || '';
            } else {
              info.innerHTML = target.innerHTML || '';
            }
          }
          return { ...info };
        });
        resolve({
          added: infos,
        });
      });
    });
  }

  public getIndex(id: string | HTMLElement) {
    const indexes = this.getIndexes(id);
    const length = indexes.length;
    return length ? indexes[length - 1] : -1;
  }

  public getElements(ids: string[]) {
    return ids.map((id) => this.getElement(id)).filter((el) => el) as Array<
      HTMLElement | SVGElement
    >;
  }

  public unregisterChildren(
    children: ElementInfo[],
    isChild?: boolean,
  ): ElementInfo[] {
    const ids = this.ids;
    return children.slice(0).map((info) => {
      const target = info.el!;
      let innerText = '';
      let innerHTML = '';

      if (info.attrs!.contenteditable) {
        innerText = (target as HTMLElement).innerText;
      } else {
        innerHTML = target.innerHTML;
      }

      if (!isChild) {
        // 在父元素中去除
        const parentInfo = this.getInfo(info.scopeId!);
        const parentChildren = parentInfo.children!;
        const index = parentChildren.indexOf(info);
        parentInfo.children!.splice(index, 1);
      }
      const nextChildren = this.unregisterChildren(info.children!, true);

      // 在列表中去除
      delete ids[info.id!];
      delete info.el;

      return {
        ...info,
        innerText,
        innerHTML,
        attrs: getScenaAttrs(target),
        children: nextChildren,
      };
    });
  }

  public removeTargets(
    targets: Array<HTMLElement | SVGElement>,
  ): Promise<RemovedInfo> {
    const removedChildren = this.getSortedTargets(targets)
      .map((target) => {
        return this.getInfoByElement(target);
      })
      .filter((info) => info) as ElementInfo[];
    const indexes = removedChildren.map((info) => this.getIndex(info.id!));
    const removed = this.unregisterChildren(removedChildren);
    removed.forEach((info, i) => {
      info.index = indexes[i];
    });
    return new Promise((resolve) => {
      this.forceUpdate(() => {
        resolve({
          removed,
        });
      });
    });
  }

  // 获取所有排序后的元素的idx链，排序规则：1.从小到大2.从上层到下层
  public getSortedIndexesList(
    targets: Array<string | HTMLElement | SVGElement | number[]>,
  ) {
    // 获取所有元素的idx链
    const indexesList = targets.map((target) => {
      if (Array.isArray(target)) {
        return target;
      }
      return this.getIndexes(target!);
    });

    // 进行排序，1.从小到大2.从上层到下层
    indexesList.sort((a, b) => {
      const aLength = a.length;
      const bLength = b.length;
      const length = Math.min(aLength, bLength);

      for (let i = 0; i < length; ++i) {
        if (a[i] === b[i]) {
          continue;
        }
        return a[i] - b[i];
      }
      return aLength - bLength;
    });

    return indexesList;
  }

  public getSortedTargets(targets: Array<string | HTMLElement | SVGElement>) {
    return this.getSortedInfos(targets).map((info) => info.el!);
  }

  // 获取筛选过的info列表
  public getSortedInfos(targets: Array<string | HTMLElement | SVGElement>) {
    // 获取元素列表筛选过的idx链列表
    const indexesList = this.getSortedIndexesList(targets);
    // 获取筛选过的info列表
    return indexesList.map((indexes) => this.getInfoByIndexes(indexes));
  }

  // 暂不用。移动元素到前一个元素下作为子级，但是前一个元素应该是普通元素
  public moveInside(
    target: HTMLElement | SVGElement | string,
  ): Promise<MovedResult> {
    // 拿到元素info
    const info = isString(target)
      ? this.getInfo(target)!
      : this.getInfoByElement(target)!;

    // 拿到上一个info
    const prevInfo = this.getPrevInfo(info.id!);

    let moved: ElementInfo[];

    // 不存在上一个info || 上一个是组件方法 || 上一个是函数式组件元素
    if (
      !prevInfo ||
      isScenaFunction(prevInfo.jsx) ||
      isScenaFunctionElement(prevInfo.jsx)
    ) {
      moved = [];
    } else {
      // 只对一个元素进行操作？
      moved = [info];
    }
    // prevInfo的最后一个子元素info
    const lastInfo = prevInfo && this.getLastChildInfo(prevInfo.id!);
    // 为什么是移动到前一个元素（作为父级）中的？
    return this.move(moved, prevInfo, lastInfo);
  }

  // 暂不用
  public moveOutside(
    target: HTMLElement | SVGElement | string,
  ): Promise<MovedResult> {
    // 拿到元素info
    const info = isString(target)
      ? this.getInfo(target)!
      : this.getInfoByElement(target)!;
    // 拿到父级info
    const parentInfo = this.getInfo(info.scopeId!);
    // 拿到父级的父级info，为啥这就是root了，最多三层？
    const rootInfo = this.getInfo(parentInfo.scopeId!);

    const moved = rootInfo ? [info] : [];

    return this.move(moved, rootInfo, parentInfo);
  }

  // 暂不用，位置移动，从一个父级移动到另一个父级下面
  public moves(
    nextInfos: Array<{
      info: ElementInfo;
      parentInfo: ElementInfo;
      prevInfo?: ElementInfo;
    }>,
  ): Promise<MovedResult> {
    // 移动之前的info信息
    const prevInfos = nextInfos.map(({ info }) => {
      return {
        info,
        parentInfo: this.getInfo(info.scopeId!),
        prevInfo: this.getPrevInfo(info.id!),
      };
    });
    //
    nextInfos.forEach(({ info, parentInfo, prevInfo }) => {
      const children = this.getInfo(info.scopeId!).children!;

      // 之前的子元素里面要进行info去除
      children.splice(children.indexOf(info), 1);

      const parnetChildren = parentInfo.children!;
      // 之后的父级子元素要加入info
      parnetChildren.splice(
        prevInfo ? parnetChildren.indexOf(prevInfo) + 1 : 0,
        0,
        info,
      );
      // 更改父级id
      info.scopeId = parentInfo.id;
    });

    const infos = nextInfos.map(({ info }) => info);

    return new Promise((resolve) => {
      this.forceUpdate(() => {
        infos.forEach(function moveInfo(info) {
          const id = info.id!;
          const target = document.querySelector<HTMLElement>(
            `[${DATA_SCENA_ELEMENT_ID}="${id}"]`,
          )!;
          // 渲染元素后将el替换
          info.el = target;

          info.children!.forEach(moveInfo);
        });
        // 用于恢复的
        resolve({
          moved: infos,
          prevInfos,
          nextInfos,
        });
      });
    });
  }

  // 暂不用，移动元素infos到父级
  public move(
    infos: ElementInfo[],
    parentInfo: ElementInfo,
    prevInfo?: ElementInfo,
  ): Promise<MovedResult> {
    // 获取筛选过的info列表
    const sortedInfos = this.getSortedInfos(infos.map((info) => info.el!));

    return this.moves(
      sortedInfos.map((info, i) => {
        return {
          info,
          // 设置父级info
          parentInfo,
          // 设置前一个info，第一个的话，前一个就是之前的最后一个
          prevInfo: i === 0 ? prevInfo : sortedInfos[i - 1],
        };
      }),
    );
  }
}
