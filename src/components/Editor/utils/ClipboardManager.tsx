import * as React from 'react';
import html2canvas from 'html2canvas';
import MoveableGroup from 'react-moveable/declaration/MoveableGroup';
import { ClipboardItem, SavedScenaData } from '../types';
import Editor from '../Editor';
import { checkInput } from './utils';
import { TYPE_SCENA_LAYERS } from '../consts';

export default class ClipboardManager {
  constructor(private editor: Editor) {
    document.addEventListener('cut', this.onCut);
    document.addEventListener('copy', this.onCopy);
    document.addEventListener('paste', this.onPaste);
  }

  public destroy() {
    document.removeEventListener('cut', this.onCut);
    document.removeEventListener('copy', this.onCopy);
    document.removeEventListener('paste', this.onPaste);
  }

  public copy() {
    document.execCommand('copy');
  }

  public cut() {
    document.execCommand('cut');
  }

  public paste() {
    document.execCommand('paste');
  }

  // 复制图片，可能用不到
  public copyImage() {
    const moveableData = this.editor.moveableData;
    const targets = moveableData.getSelectedTargets();
    const moveable = this.editor.getMoveable();
    const length = targets.length;
    const moveables =
      length > 1 ? (moveable.moveable as MoveableGroup).moveables : [];

    return new Promise((resolve) => {
      Promise.all(
        targets.map((target) => html2canvas(target as HTMLElement)),
      ).then((images) => {
        let imageCanvas: HTMLCanvasElement;
        if (length > 1) {
          const parentRect = moveable.getRect();
          const canvas = document.createElement('canvas');
          canvas.width = parentRect.width;
          canvas.height = parentRect.height;
          const context = canvas.getContext('2d')!;
          const rects = moveables.map((m) => m.getRect());

          rects.forEach((rect, i) => {
            context.drawImage(
              images[i],
              rect.left - parentRect.left,
              rect.top - parentRect.top,
            );
          });

          imageCanvas = canvas;
        } else {
          imageCanvas = images[0];
        }
        imageCanvas.toBlob((blob) => {
          (navigator.clipboard as any).write([
            new (window as any).ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve();
        });
      });
    });
  }

  // 元素剪切功能
  private onCut = (e: any) => {
    // 复制选中元素的产出json结构
    const copied = this.onCopy(e);

    if (!copied) {
      return;
    }
    this.editor.console.log('cut scena data');
    // 选中元素的移除
    this.editor.removeElements(this.editor.getSelectedTargets());
  };

  // 复制选中元素的产出json结构
  private onCopy = async (e: any) => {
    // 检查元素是否是可编辑类型，是的话不能复制。为什么不能复制？
    if (checkInput(e.target)) {
      return false;
    }
    e.preventDefault();

    const clipboardData = (e as any).clipboardData as DataTransfer;
    // 获取选中的元素
    const moveableData = this.editor.moveableData;
    const targets = moveableData.getSelectedTargets();
    // 获取选中元素的产出json结构
    const SavedScenaData = this.editor.saveTargets(targets);
    this.editor.console.log('copy scena data', SavedScenaData);
    // 将json结构存于剪切板
    clipboardData.setData(TYPE_SCENA_LAYERS, JSON.stringify(SavedScenaData));
    return true;
  };

  // 粘贴
  private onPaste = (e: any) => {
    // 检查元素是否是可编辑类型，是的话不能复制。
    if (checkInput(e.target)) {
      return;
    }

    // e.clipboardData是剪切面板当前存在的，当然也带有数据
    this.read((e as any).clipboardData);
    e.preventDefault();
  };

  // 已有组件元素的复制粘贴
  private readDataTransfter(data: DataTransfer) {
    const types = data.types;
    // 代表是否为copy了元素拿到的
    const hasScena = types.indexOf(TYPE_SCENA_LAYERS) > -1;

    if (hasScena) {
      // 是组件元素的话，parse元素json
      const scenaDatas = JSON.parse(
        data.getData(TYPE_SCENA_LAYERS),
      ) as SavedScenaData[];

      this.editor.console.log('paste scena data', scenaDatas);
      // 导入元素json
      this.editor.loadDatas(scenaDatas);
      return true;
    }
    return false;
  }

  // 读取剪切板内容并进行粘贴-元素新建
  private async read(data: DataTransfer) {
    // 已有组件的粘贴
    if (this.readDataTransfter(data)) {
      return true;
    }
    // 下面是外部元素的粘贴
    const clipboardItems: ClipboardItem[] = await (
      navigator.clipboard as any
    ).read();

    let hasText = false;
    // 图片类型的粘贴
    const isPaste =
      clipboardItems.filter((item) => {
        const types = item.types;

        const hasImage = types.indexOf('image/png') > -1;
        hasText = hasText || types.indexOf('text/plain') > -1;

        if (hasImage) {
          item.getType('image/png').then((blob) => {
            this.editor.appendBlob(blob);
          });
          return true;
        }
        return false;
      }).length > 0;

    // 文本类型的粘贴
    if (!isPaste && hasText) {
      const text = await navigator.clipboard.readText();

      this.editor.appendJSXs([
        {
          jsx: <div contentEditable="true" />,
          name: '(Text)',
          innerText: text,
        },
      ]);
    }
  }
}
