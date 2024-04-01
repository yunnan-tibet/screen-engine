import { prefixNames } from 'framework-utils';
import { IObject } from '@daybrush/utils';
import { isFunction, isObject } from 'util';
import { PREFIX, DATA_SCENA_ELEMENT_ID, EDITOR_PROPERTIES } from '../consts';
import {
  ScenaFunctionComponent,
  ScenaProps,
  ScenaComponent,
  ScenaJSXElement,
  ScenaFunctionJSXElement,
} from '../types';
import Editor from '../Editor';

export function prefix(...classNames: string[]) {
  return prefixNames(PREFIX, ...classNames);
}
export function getContentElement(el: HTMLElement): HTMLElement | null {
  if (el.contentEditable === 'inherit') {
    return getContentElement(el.parentElement!);
  }
  if (el.contentEditable === 'true') {
    return el;
  }
  return null;
}

export function connectEditorProps(component: any) {
  const prototype = component.prototype;
  Object.defineProperty(prototype, 'editor', {
    get() {
      return this.props.editor;
    },
  });
  EDITOR_PROPERTIES.forEach((name) => {
    Object.defineProperty(prototype, name, {
      get() {
        return this.props.editor[name];
      },
    });
  });
}
export function between(val: number, min: number, max: number) {
  return Math.min(Math.max(min, val), max);
}

// 获取元素的DATA_SCENA_ELEMENT_ID
export function getId(el: HTMLElement | SVGElement) {
  return el.getAttribute(DATA_SCENA_ELEMENT_ID)!;
}
// 获取多个元素的DATA_SCENA_ELEMENT_ID
export function getIds(els: Array<HTMLElement | SVGElement>): string[] {
  return els.map((el) => getId(el));
}

// 获取最大zIdx
export function getMaxZIdx(editor: Editor) {
  const data = editor.moveableData;
  const infos = editor.getViewportInfos();
  const viewport = editor.getViewport();
  return infos.reduce((res, item) => {
    const frame = data.getFrame(
      viewport.getElement(item.id as string) as HTMLElement,
    );
    const zIdx = +frame.get('z-index');
    return res > zIdx ? res : zIdx;
  }, 1);
}

// 获取最小zIdx
export function getMinZIdx(editor: Editor) {
  const data = editor.moveableData;
  const infos = editor.getViewportInfos();
  const viewport = editor.getViewport();
  return infos.reduce((res, item) => {
    const frame = data.getFrame(
      viewport.getElement(item.id as string) as HTMLElement,
    );
    const zIdx = +frame.get('z-index');
    return res < zIdx ? res : zIdx;
  }, 1);
}

// 获取元素距离窗口的offsetTop和offsetLeft
export function getWindowOffset(element: HTMLElement) {
  let offsetTop = 0;
  let offsetLeft = 0;
  let ele: HTMLElement = element;

  // 循环遍历所有的父元素，直到根元素为止
  while (ele) {
    offsetTop += ele.offsetTop - ele.scrollTop;
    offsetLeft += ele.offsetLeft - ele.scrollLeft;
    ele = ele.offsetParent as HTMLElement;
  }

  return { offsetTop, offsetLeft };
}

// 判断元素是否可编辑，本身设置了isContentEditable ｜ inpt ｜ textarea
export function checkInput(target: HTMLElement | SVGElement) {
  const tagName = target.tagName.toLowerCase();

  return (
    (target as HTMLElement).isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea'
  );
}
export function checkImageLoaded(el: HTMLElement | SVGElement): Promise<any> {
  if (el.tagName.toLowerCase() !== 'img') {
    return Promise.all(
      [].slice
        .call(el.querySelectorAll('img'))
        .map((el) => checkImageLoaded(el)),
    );
  }
  return new Promise((resolve) => {
    if ((el as HTMLImageElement).complete) {
      resolve();
    } else {
      el.addEventListener('load', function loaded() {
        resolve();

        el.removeEventListener('load', loaded);
      });
    }
  });
}

export function getParnetScenaElement(
  el: HTMLElement | SVGElement,
): HTMLElement | SVGElement | null {
  if (!el) {
    return null;
  }
  if (el.hasAttribute(DATA_SCENA_ELEMENT_ID)) {
    return el;
  }
  return getParnetScenaElement(el.parentElement as HTMLElement | SVGElement);
}

export function makeScenaFunctionComponent<T = IObject<any>>(
  id: string,
  component: (props: ScenaProps & T) => React.ReactElement<any, any>,
): ScenaFunctionComponent<T> {
  (component as ScenaFunctionComponent<T>).scenaComponentId = id;

  return component as ScenaFunctionComponent<T>;
}

// 获取元素的attributes
export function getScenaAttrs(el: HTMLElement | SVGElement) {
  const attributes = el.attributes;
  const length = attributes.length;
  const attrs: IObject<any> = {};

  for (let i = 0; i < length; ++i) {
    const { name, value } = attributes[i];
    // DATA_SCENA_ELEMENT_ID和style两个attrs是不进行保存的
    if (name === DATA_SCENA_ELEMENT_ID || name === 'style') {
      continue;
    }
    attrs[name] = value;
  }

  return attrs;
}

// 是组件方法-方法
export function isScenaFunction(value: any): value is ScenaComponent {
  return isFunction(value) && 'scenaComponentId' in value;
}

// 是元素-实例
export function isScenaElement(value: any): value is ScenaJSXElement {
  return isObject(value) && !isScenaFunction(value);
}

// 是函数式组件元素-实例
export function isScenaFunctionElement(
  value: any,
): value is ScenaFunctionJSXElement {
  return isScenaElement(value) && isFunction(value.type);
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}
