import * as React from 'react';
import Moveable, { MoveableManagerInterface } from 'react-moveable';
import { IObject } from '@daybrush/utils';
import { diff } from '@egjs/list-differ';
import { getContentElement, connectEditorProps, getId } from '../utils/utils';
import Editor from '../Editor';
import { EditorInterface } from '../types';

function restoreRender(
  id: string,
  state: IObject<any>,
  prevState: IObject<any>,
  orders: any,
  editor: Editor,
) {
  const el = editor.viewport.current!.getElement(id);

  if (!el) {
    console.error('No Element');
    return false;
  }
  const moveableData = editor.moveableData;
  const frame = moveableData.getFrame(el);

  frame.clear();
  frame.set(state);
  frame.setOrderObject(orders);

  const result = diff(Object.keys(prevState), Object.keys(state));
  const { removed, prevList } = result;

  removed.forEach((index) => {
    el.style.removeProperty(prevList[index]);
  });
  moveableData.render(el);
  return true;
}
function undoRender(
  { id, prev, next, prevOrders }: IObject<any>,
  editor: Editor,
) {
  if (!restoreRender(id, prev, next, prevOrders, editor)) {
    return;
  }
  editor.moveableManager.current!.updateRect();
  editor.eventBus.trigger('render');
}
function redoRender(
  { id, prev, next, nextOrders }: IObject<any>,
  editor: Editor,
) {
  if (!restoreRender(id, next, prev, nextOrders, editor)) {
    return;
  }
  editor.moveableManager.current!.updateRect();
  editor.eventBus.trigger('render');
}
function undoRenders({ infos }: IObject<any>, editor: Editor) {
  infos.forEach(({ id, prev, next, prevOrders }: IObject<any>) => {
    restoreRender(id, prev, next, prevOrders, editor);
  });
  editor.moveableManager.current!.updateRect();
  editor.eventBus.trigger('render');
}
function redoRenders({ infos }: IObject<any>, editor: Editor) {
  infos.forEach(({ id, next, prev, nextOrders }: IObject<any>) => {
    restoreRender(id, next, prev, nextOrders, editor);
  });
  editor.moveableManager.current!.updateRect();
  editor.eventBus.trigger('render');
}

export interface DimensionViewableProps {
  dimensionViewable?: boolean;
}
const DimensionViewable = {
  name: 'dimensionViewable',
  props: {
    dimensionViewable: Boolean,
  },
  events: {},
  render(moveable: MoveableManagerInterface) {
    const { left, top } = moveable.state;

    const rect = moveable.getRect();

    return (
      <div
        key="dimension-viewer"
        className="moveable-dimension"
        style={{
          left: `${rect.left + rect.width / 2 - left}px`,
          top: `${rect.top + rect.height + 20 - top}px`,
        }}
      >
        {Math.round(rect.offsetWidth)} x {Math.round(rect.offsetHeight)}
      </div>
    );
  },
};
@connectEditorProps
export default class MoveableManager extends React.PureComponent<{
  editor: Editor; // 整个编辑器
  selectedTargets: Array<HTMLElement | SVGElement>; // 选中的元素
  selectedMenu: string; // 选中的菜单模式，目前默认或只用拖动-MoveTool
  verticalGuidelines: number[]; // 垂直的rule数值配置
  horizontalGuidelines: number[];
}> {
  // 主moveable元素
  public moveable = React.createRef<Moveable>();

  // 获取主moveable实例
  public getMoveable() {
    return this.moveable.current!;
  }

  public render() {
    const {
      editor,
      verticalGuidelines,
      horizontalGuidelines,
      selectedTargets,
      selectedMenu,
    } = this.props;

    if (!selectedTargets.length) {
      return this.renderViewportMoveable();
    }
    const { moveableData, keyManager, eventBus, selecto, memory } = editor;
    const elementGuidelines = [...moveableData.getTargets()].filter((el) => {
      return selectedTargets.indexOf(el) === -1;
    });
    const isShift = keyManager.shiftKey;
    return (
      <Moveable<DimensionViewableProps>
        ables={[DimensionViewable]}
        ref={this.moveable}
        targets={selectedTargets}
        dimensionViewable
        draggable
        resizable
        throttleResize={1}
        // clippable={selectedMenu === 'Crop'}
        dragArea={selectedTargets.length > 1 || selectedMenu !== 'Text'}
        // checkInput={selectedMenu === 'Text'}
        throttleDragRotate={isShift ? 45 : 0}
        keepRatio={isShift}
        rotatable
        snappable
        snapCenter
        snapGap={false}
        roundable
        verticalGuidelines={verticalGuidelines}
        horizontalGuidelines={horizontalGuidelines}
        elementGuidelines={elementGuidelines}
        clipArea
        onBeforeRenderStart={moveableData.onBeforeRenderStart}
        onBeforeRenderGroupStart={moveableData.onBeforeRenderGroupStart}
        onDragStart={moveableData.onDragStart}
        onDrag={moveableData.onDrag}
        onDragGroupStart={moveableData.onDragGroupStart}
        onDragGroup={moveableData.onDragGroup}
        onScaleStart={moveableData.onScaleStart}
        onScale={moveableData.onScale}
        onScaleGroupStart={moveableData.onScaleGroupStart}
        onScaleGroup={moveableData.onScaleGroup}
        onResizeStart={moveableData.onResizeStart}
        onResize={moveableData.onResize}
        onResizeGroupStart={moveableData.onResizeGroupStart}
        onResizeGroup={moveableData.onResizeGroup}
        onRotateStart={moveableData.onRotateStart}
        onRotate={moveableData.onRotate}
        onRotateGroupStart={moveableData.onRotateGroupStart}
        onRotateGroup={moveableData.onRotateGroup}
        defaultClipPath={memory.get('crop') || 'inset'}
        onClip={moveableData.onClip}
        onDragOriginStart={moveableData.onDragOriginStart}
        onDragOrigin={(e) => {
          moveableData.onDragOrigin(e);
        }}
        onRound={moveableData.onRound}
        onClick={(e) => {
          const target = e.inputTarget as any;
          if (e.isDouble && target.isContentEditable) {
            editor.selectMenu('Text');
            const el = getContentElement(target);

            if (el) {
              el.focus();
            }
          }
        }}
        onClickGroup={(e) => {
          selecto.current!.clickTarget(e.inputEvent, e.inputTarget);
        }}
        onRenderStart={(e) => {
          e.datas.prevData = moveableData.getFrame(e.target).get();
        }}
        onRender={(e) => {
          e.datas.isRender = true;
          eventBus.requestTrigger('render');
        }}
        onRenderEnd={(e) => {
          eventBus.requestTrigger('render');

          if (!e.datas.isRender) {
            return;
          }
          this.historyManager.addAction('render', {
            id: getId(e.target),
            prev: e.datas.prevData,
            next: moveableData.getFrame(e.target).get(),
          });
        }}
        onRenderGroupStart={(e) => {
          e.datas.prevDatas = e.targets.map((target) =>
            moveableData.getFrame(target).get(),
          );
        }}
        onRenderGroup={(e) => {
          eventBus.requestTrigger('renderGroup', e);
          e.datas.isRender = true;
        }}
        onRenderGroupEnd={(e) => {
          eventBus.requestTrigger('renderGroup', e);

          if (!e.datas.isRender) {
            return;
          }
          const prevDatas = e.datas.prevDatas;
          const infos = e.targets.map((target, i) => {
            return {
              id: getId(target),
              prev: prevDatas[i],
              next: moveableData.getFrame(target).get(),
            };
          });
          this.historyManager.addAction('renders', {
            infos,
          });
        }}
      />
    );
  }

  public renderViewportMoveable() {
    const moveableData = this.moveableData;
    const viewport = this.editor.getViewport();
    const target = viewport ? viewport.viewportRef.current! : null;

    return (
      <Moveable
        ref={this.moveable}
        rotatable
        target={target}
        origin={false}
        onRotateStart={moveableData.onRotateStart}
        onRotate={moveableData.onRotate}
      />
    );
  }

  public componentDidMount() {
    this.historyManager.registerType('render', undoRender, redoRender);
    this.historyManager.registerType('renders', undoRenders, redoRenders);
    this.keyManager.keydown(['shift'], () => {
      this.forceUpdate();
    });
    this.keyManager.keyup(['shift'], () => {
      this.forceUpdate();
    });
  }

  public updateRect() {
    this.getMoveable().updateRect();
  }
}
export default interface MoveableManager extends EditorInterface {}
