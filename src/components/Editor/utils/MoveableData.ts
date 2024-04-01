import MoveableHelper from 'moveable-helper';
import { Frame, NameType } from 'scenejs';
import Memory from './Memory';
import { getId } from './utils';

export default class MoveableData extends MoveableHelper {
  public selectedTargets: Array<HTMLElement | SVGElement> = [];

  constructor(private memory: Memory) {
    super({
      createAuto: true,
      useBeforeRender: true,
    });
  }

  // 设置选中的元素列表
  public setSelectedTargets(targets: Array<HTMLElement | SVGElement>) {
    this.selectedTargets = targets;
  }

  // 获取选中的元素列表
  public getSelectedTargets() {
    return this.selectedTargets;
  }

  // 获取选中元素的frames，frame其实就是元素的样式
  public getSelectedFrames(): Frame[] {
    return this.getSelectedTargets().map((target) => this.getFrame(target));
  }

  // 渲染选中的元素的样式，实际是frame的变更要进行重新样式渲染
  public renderFrames() {
    this.getSelectedTargets().forEach((target: any) => {
      this.render(target);
    });
  }

  // 渲染所有元素的样式，这个目前是针对层级上移下移的时候，可能涉及到所有的元素zIndex变化，当然也可以优化
  public renderAllFrames() {
    for (const target of this.getTargets()) {
      this.render(target);
    }
  }

  // 主要是设置动画属性的顺序
  public setOrders(scope: string[], orders: NameType[]) {
    return this.setValue((frame) => {
      frame.setOrders(scope, orders);
    });
  }

  // 设置选中元素的样式属性
  public setProperty(names: string[], value: any) {
    return this.setValue((frame) => {
      frame.set(...names, value);
    });
  }

  // 移除选中元素的样式属性
  public removeProperties(...names: string[]) {
    return this.setValue((frame, target) => {
      names.forEach((name) => {
        frame.remove(name);
        target.style.removeProperty(name);
      });
    });
  }

  public getProperties(properties: string[][], defaultValues: any[]) {
    const frames = this.getSelectedFrames();
    const memory = this.memory;

    if (!frames.length) {
      return properties.map(
        (property, i) => memory.get(property.join('///')) || defaultValues[i],
      );
    }

    return properties.map((property, i) => {
      const frameValues = frames.map((frame) => frame.get(...property));

      return frameValues.filter((color) => color)[0] || defaultValues[i];
    });
  }

  // 设置值之后进行样式渲染
  private setValue(
    callback: (frame: Frame, target: HTMLElement | SVGElement) => void,
  ) {
    const targets = this.getSelectedTargets();
    // 对已选中元素的遍历
    const infos = targets.map((target) => {
      const frame = this.getFrame(target);

      // order应该是属性的顺序列表，没看明白
      // 获取更改前的orders
      const prevOrders = frame.getOrderObject();
      const prev = frame.get();
      // 回调执行
      callback(frame, target);
      // 获取更改后的orders
      const next = frame.get();
      const nextOrders = frame.getOrderObject();

      return { id: getId(target), prev, prevOrders, next, nextOrders };
    });
    // 每次设置完选中的元素，进行重新渲染
    // 若是带children的咋办？似乎也并不用管
    this.renderFrames();

    return infos;
  }
}
