import * as React from 'react';
import InfiniteViewer from 'react-infinite-viewer';
import Guides from '@scena/react-guides';
import Selecto, { Rect } from 'react-selecto';
import './Editor.css';
import { IObject } from '@daybrush/utils';
import { NameType } from 'scenejs';
import Menu from './Menu/Menu';
import Viewport, {
  ElementInfo,
  MovedInfo,
  MovedResult,
} from './Viewport/Viewport';
import {
  getContentElement,
  prefix,
  getIds,
  checkImageLoaded,
  checkInput,
  getParnetScenaElement,
  getScenaAttrs,
  makeScenaFunctionComponent,
  getMaxZIdx,
  getWindowOffset,
} from './utils/utils';
// import Tabs from './Tabs/Tabs';
import EventBus from './utils/EventBus';
import Memory from './utils/Memory';
import MoveableManager from './Viewport/MoveableMananger';
import MoveableData from './utils/MoveableData';
import KeyManager from './KeyManager/KeyManager';
import {
  ScenaEditorState,
  SavedScenaData,
  ScenaJSXElement,
  ScenaProps,
} from './types';
import HistoryManager from './utils/HistoryManager';
import Debugger from './utils/Debugger';
import { isMacintosh, DATA_SCENA_ELEMENT_ID } from './consts';
import ClipboardManager from './utils/ClipboardManager';
import ConfigPanel, { IConfigPanelRef } from './ConfigPanel';
import CompPanel, { ICompPanelRef } from './CompPanel';
import Header, { IHeaderRef } from './Header';
import RightClickMenu, { IRightClickMenuRef } from './RightClickMenu';
import { getResources } from './utils/statisticConfig';
import Tabs from './Tabs/Tabs';

function undoCreateElements(
  { infos, prevSelected }: IObject<any>,
  editor: Editor,
) {
  const res = editor.removeByIds(
    infos.map((info: ElementInfo) => info.id),
    true,
  );

  if (prevSelected) {
    res.then(() => {
      editor.setSelectedTargets(
        editor.getViewport().getElements(prevSelected),
        true,
      );
    });
  }
}
function restoreElements({ infos }: IObject<any>, editor: Editor) {
  editor.appendJSXs(
    infos.map((info: ElementInfo) => ({
      ...info,
    })),
    true,
  );
}
function undoSelectTargets({ prevs, nexts }: IObject<any>, editor: Editor) {
  editor.setSelectedTargets(editor.viewport.current!.getElements(prevs), true);
}
function redoSelectTargets({ prevs, nexts }: IObject<any>, editor: Editor) {
  editor.setSelectedTargets(editor.viewport.current!.getElements(nexts), true);
}
function undoChangeText({ prev, next, id }: IObject<any>, editor: Editor) {
  const info = editor.getViewport().getInfo(id)!;
  info.innerText = prev;
  info.el!.innerText = prev;
}
function redoChangeText({ prev, next, id }: IObject<any>, editor: Editor) {
  const info = editor.getViewport().getInfo(id)!;
  info.innerText = next;
  info.el!.innerText = next;
}
function undoMove({ prevInfos }: MovedResult, editor: Editor) {
  editor.moves(prevInfos, true);
}
function redoMove({ nextInfos }: MovedResult, editor: Editor) {
  editor.moves(nextInfos, true);
}
export default class Editor extends React.PureComponent<
  {
    width: number;
    height: number;
    debug?: boolean;
  },
  Partial<ScenaEditorState>
> {
  // 画布宽高
  public static defaultProps = {
    width: 1920,
    height: 1080,
  };

  public state: ScenaEditorState = {
    selectedTargets: [], // 选中的元素
    horizontalGuides: [], // 横行rule
    verticalGuides: [], // 垂直rule
    zoom: 1, // 放大缩小
    selectedMenu: 'MoveTool', // 选中的操作模式为画布拖动
    resources: { schema: {}, source: {} },
  };

  // 管理回退
  public historyManager = new HistoryManager(this);

  // 日志
  public console = new Debugger(this.props.debug);

  // 事件管理
  public eventBus = new EventBus();

  // map的存储工具,get,set,clear，用于editor的全局存储
  public memory = new Memory();

  // 目前选中的元素，主要是对样式的更改渲染
  public moveableData = new MoveableData(this.memory);

  // 按键事件管理
  public keyManager = new KeyManager(this.console);

  // 剪切板管理
  public clipboardManager = new ClipboardManager(this);

  // 横向rule
  public horizontalGuides = React.createRef<Guides>();

  // 垂直rule
  public verticalGuides = React.createRef<Guides>();

  // 无限滚动画布
  public infiniteViewer = React.createRef<InfiniteViewer>();

  // 选择框
  public selecto = React.createRef<Selecto>();

  // 菜单，现在暂时不用，默认选定模式-MoveTool
  public menu = React.createRef<Menu>();

  // moveable工具
  public moveableManager = React.createRef<MoveableManager>();

  // 中心画布ref
  public viewport = React.createRef<Viewport>();

  // 右侧tabs，暂不用，需要用配置panel替代
  public tabs = React.createRef<Tabs>();

  // 配置解析的表单panel
  public configPanel = React.createRef<IConfigPanelRef>();

  // 左侧组件panel
  public compPanel = React.createRef<ICompPanelRef>();

  // 顶部
  public header = React.createRef<IHeaderRef>();

  // 右键工具
  public rightClickMenu = React.createRef<IRightClickMenuRef>();

  // 当前元素
  public editorElement = React.createRef<HTMLDivElement>();

  public render() {
    const {
      horizontalGuides,
      verticalGuides,
      infiniteViewer,
      moveableManager,
      viewport,
      menu,
      tabs,
      rightClickMenu,
      header,
      compPanel,
      configPanel,
      selecto,
      state,
    } = this;
    const { selectedMenu, selectedTargets, zoom, resources } = state;
    const { width, height } = this.props;
    const horizontalSnapGuides = [
      0,
      height,
      height / 2,
      ...state.horizontalGuides,
    ];
    const verticalSnapGuides = [0, width, width / 2, ...state.verticalGuides];
    let unit = 50;

    if (zoom < 0.8) {
      unit = Math.floor(1 / zoom) * 50;
    }

    return (
      <div className={prefix('editor')} ref={this.editorElement}>
        <RightClickMenu ref={rightClickMenu} editor={this} />
        {/* <Tabs ref={tabs} editor={this} /> */}
        <Header ref={header} editor={this} />
        <CompPanel resources={resources} ref={compPanel} editor={this} />
        <ConfigPanel ref={configPanel} editor={this} />
        <Menu ref={menu} editor={this} onSelect={this.onMenuChange} />
        {/* <div
          className={prefix('reset')}
          onClick={(e) => {
            infiniteViewer.current!.scrollCenter();
          }}
        /> */}
        <Guides
          ref={horizontalGuides}
          type="horizontal"
          className={prefix('guides', 'horizontal')}
          style={{}}
          snapThreshold={5}
          snaps={horizontalSnapGuides}
          displayDragPos
          dragPosFormat={(v) => `${v}px`}
          zoom={zoom}
          unit={unit}
          onChangeGuides={(e) => {
            this.setState({
              horizontalGuides: e.guides,
            });
          }}
        />
        <Guides
          ref={verticalGuides}
          type="vertical"
          className={prefix('guides', 'vertical')}
          style={{}}
          snapThreshold={5}
          snaps={verticalSnapGuides}
          displayDragPos
          dragPosFormat={(v) => `${v}px`}
          zoom={zoom}
          unit={unit}
          onChangeGuides={(e) => {
            this.setState({
              verticalGuides: e.guides,
            });
          }}
        />
        <InfiniteViewer
          ref={infiniteViewer}
          className={prefix('viewer')}
          usePinch
          pinchThreshold={50}
          zoom={zoom}
          displayHorizontalScroll={false}
          displayVerticalScroll={false}
          onDragStart={(e) => {
            const target = e.inputEvent.target;
            this.checkBlur();

            if (
              target.nodeName === 'A' ||
              moveableManager
                .current!.getMoveable()
                .isMoveableElement(target) ||
              selectedTargets.some((t) => t === target || t.contains(target))
            ) {
              e.stop();
            }
          }}
          onDragEnd={(e) => {
            if (!e.isDrag) {
              selecto.current!.clickTarget(e.inputEvent);
            }
          }}
          onAbortPinch={(e) => {
            selecto.current!.triggerDragStart(e.inputEvent);
          }}
          onScroll={(e) => {
            horizontalGuides.current!.scroll(e.scrollLeft);
            horizontalGuides.current!.scrollGuides(e.scrollTop);

            verticalGuides.current!.scroll(e.scrollTop);
            verticalGuides.current!.scrollGuides(e.scrollLeft);
          }}
          onPinch={(e) => {
            this.setState({
              zoom: e.zoom,
            });
          }}
        >
          <Viewport
            ref={viewport}
            onBlur={this.onBlur}
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            <MoveableManager
              ref={moveableManager}
              selectedTargets={selectedTargets}
              selectedMenu={selectedMenu}
              verticalGuidelines={verticalSnapGuides}
              horizontalGuidelines={horizontalSnapGuides}
              editor={this}
            />
          </Viewport>
        </InfiniteViewer>

        <Selecto
          ref={selecto}
          dragContainer=".scena-viewer"
          hitRate={0}
          selectableTargets={[`.scena-viewport [${DATA_SCENA_ELEMENT_ID}]`]}
          selectByClick
          selectFromInside={false}
          toggleContinueSelect={['shift']}
          preventDefault
          scrollOptions={
            infiniteViewer.current
              ? {
                  container: infiniteViewer.current.getContainer(),
                  threshold: 30,
                  throttleTime: 30,
                  getScrollPosition: () => {
                    const current = infiniteViewer.current!;
                    return [current.getScrollLeft(), current.getScrollTop()];
                  },
                }
              : undefined
          }
          onDragStart={(e) => {
            const inputEvent = e.inputEvent;
            const target = inputEvent.target;

            this.checkBlur();
            if (selectedMenu === 'Text' && target.isContentEditable) {
              const contentElement = getContentElement(target);

              if (
                contentElement &&
                contentElement.hasAttribute(DATA_SCENA_ELEMENT_ID)
              ) {
                e.stop();
                this.setSelectedTargets([contentElement]);
              }
            }
            if (
              (inputEvent.type === 'touchstart' && e.isTrusted) ||
              moveableManager
                .current!.getMoveable()
                .isMoveableElement(target) ||
              state.selectedTargets.some(
                (t) => t === target || t.contains(target),
              )
            ) {
              e.stop();
            }
          }}
          onScroll={({ direction }) => {
            infiniteViewer.current!.scrollBy(
              direction[0] * 10,
              direction[1] * 10,
            );
          }}
          // 选中结束回调
          onSelectEnd={({ isDragStart, selected, inputEvent, rect }) => {
            if (isDragStart) {
              inputEvent.preventDefault();
            }
            if (this.selectEndMaker(rect)) {
              return;
            }

            this.setSelectedTargets(
              this.getSecondLevelParentEles(selected),
            ).then(() => {
              if (!isDragStart) {
                return;
              }
              moveableManager.current!.getMoveable().dragStart(inputEvent);
            });
          }}
        />
      </div>
    );
  }

  public componentDidMount() {
    const { infiniteViewer, memory, eventBus } = this;
    // 全局存储，这个可以考虑用来做页面配置
    // 设置完如何生效的？
    memory.set('background-color', '#4af');
    memory.set('color', '#333');
    this.loadAtomComps();
    requestAnimationFrame(() => {
      infiniteViewer.current?.scrollCenter();
    });
    // 组件拖动到画布的操作
    const ele = infiniteViewer.current.getElement();
    ele.addEventListener('drop', this.onDrop.bind(this));
    ele.addEventListener('dragover', this.onDragOver);
    window.addEventListener('resize', this.onResize);
    const viewport = this.getViewport();

    eventBus.on('blur', () => {
      // this.menu.current!.blur();
      // this.tabs.current!.blur();
    });
    // 暂时没有用，LayerTab里面的
    // eventBus.on('selectLayers', (e: any) => {
    //   const selected = e.selected as string[];

    //   this.setSelectedTargets(
    //     selected.map((key) => viewport.getInfo(key)!.el!),
    //   );
    // });
    eventBus.on('update', () => {
      this.forceUpdate();
    });

    // 按键注册
    this.keyManager.keydown(
      ['left'],
      (e) => {
        this.move(-10, 0);
        e.inputEvent.preventDefault();
      },
      'Move Left',
    );
    this.keyManager.keydown(
      ['up'],
      (e) => {
        this.move(0, -10);
        e.inputEvent.preventDefault();
      },
      'Move Up',
    );
    this.keyManager.keydown(
      ['right'],
      (e) => {
        this.move(10, 0);
        e.inputEvent.preventDefault();
      },
      'Move Right',
    );
    this.keyManager.keydown(
      ['down'],
      (e) => {
        this.move(0, 10);
        e.inputEvent.preventDefault();
      },
      'Move Down',
    );
    this.keyManager.keyup(
      ['backspace'],
      () => {
        this.removeElements(this.getSelectedTargets());
      },
      'Delete',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'x'],
      () => {},
      'Cut',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'c'],
      () => {},
      'Copy',
    );
    // this.keyManager.keydown([isMacintosh ? "meta" : "ctrl", "shift", "c"], e => {
    //     this.clipboardManager.copyImage();
    //     e.inputEvent.preventDefault();
    // }, "Copy to Image");
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'v'],
      () => {},
      'Paste',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'z'],
      () => {
        this.historyManager.undo();
      },
      'Undo',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'shift', 'z'],
      () => {
        this.historyManager.redo();
      },
      'Redo',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'a'],
      (e) => {
        this.setSelectedTargets(
          this.getViewportInfos().map((info) => info.el!),
        );
        e.inputEvent.preventDefault();
      },
      'Select All',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'alt', 'g'],
      (e) => {
        e.inputEvent.preventDefault();
        this.moveInside();
      },
      'Move Inside',
    );
    this.keyManager.keydown(
      [isMacintosh ? 'meta' : 'ctrl', 'shift', 'alt', 'g'],
      (e) => {
        e.inputEvent.preventDefault();
        this.moveOutside();
      },
      'Move Outside',
    );
    this.historyManager.registerType(
      'createElements',
      undoCreateElements,
      restoreElements,
    );
    this.historyManager.registerType(
      'removeElements',
      restoreElements,
      undoCreateElements,
    );
    this.historyManager.registerType(
      'selectTargets',
      undoSelectTargets,
      redoSelectTargets,
    );
    this.historyManager.registerType(
      'changeText',
      undoChangeText,
      redoChangeText,
    );
    this.historyManager.registerType('move', undoMove, redoMove);
    this.setState({ zoom: 0.45 });
  }

  public componentWillUnmount() {
    this.eventBus.off();
    this.memory.clear();
    this.moveableData.clear();
    this.keyManager.destroy();
    this.clipboardManager.destroy();
    window.removeEventListener('resize', this.onResize);
  }

  // 以promise包裹setState
  public promiseState(state: Partial<ScenaEditorState>) {
    return new Promise((resolve) => {
      this.setState(state, () => {
        resolve();
      });
    });
  }

  // 加载组件库，拿到schema和source
  public loadAtomComps() {
    const context = require.context(
      '../StatisticComps',
      true,
      /^\.\/\w+\/(index\.(j|t)sx?|package.json)$/,
    );
    const { schema, src } = getResources(context);
    this.setState({
      resources: { schema, source: src },
    });
  }

  // 拖动到画布，目前仅组件
  public onDrop(ev: any) {
    ev.preventDefault();
    const infiniteViewer = this.infiniteViewer.current!;
    const { zoom } = this.state;
    const scrollTop = -infiniteViewer.getScrollTop();
    const scrollLeft = -infiniteViewer.getScrollLeft();
    const width = 300;
    const height = 300;
    const { name } = JSON.parse(ev.dataTransfer.getData('data'));
    // infiniteViewer相对于窗口的位置，不必写死的做法
    const { offsetLeft, offsetTop } = getWindowOffset(
      infiniteViewer.getElement(),
    );
    // 直接拖动到画布的情况下，宽高位置可以确定，其他都是需要初始化的
    const style = {
      // ev.clientY是相对于窗口的位置，offsetTop和offsetLeft都是容器距离窗口的偏移
      // 之后因为缩放，需要将这个点位变换zoom的比例，再减去scroll和一般的宽
      top: `${(ev.clientY - offsetTop) / zoom - scrollTop - height / 2}px`,
      left: `${(ev.clientX - offsetLeft) / zoom - scrollLeft - width / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
    this.appendComp(name, style);
  }

  // 生成组件jsx
  public generateCompJSX(
    name: string,
    style: IObject<any>,
    info?: ElementInfo,
  ) {
    const {
      resources: { source },
    } = this.state;
    const CompInner = source[name];
    const Comp = this.getScenaComponent(name, CompInner);

    return {
      attrs: {},
      ...(info || {}),
      jsx: <Comp />,
      name,
      frame: style,
    };
  }

  // 添加单个组件
  public appendComp(name: string, _style: IObject<any>) {
    // 一些通用的配置，_style为定制化下的增量
    const style = {
      position: 'absolute',
      'z-index': `${getMaxZIdx(this) + 1}`,
      ..._style,
    };
    // 通过组合生成组件的jsx
    const jsx = this.generateCompJSX(name, style);
    this.appendJSX(jsx);
  }

  public getScenaComponent(name: string, Comp: any) {
    return makeScenaFunctionComponent(name, function (props: ScenaProps) {
      const { scenaElementId, config, source } = props;

      return (
        <div
          style={{ display: 'inline-block' }}
          data-scena-element-id={scenaElementId}
        >
          <Comp config={config} source={source} />
        </div>
      );
    });
  }

  // 这里只进行已有组件的复制粘贴等加载，暂不能进行重新进入的数据加载
  public loadSchemes(datas: SavedScenaData[]) {
    const viewport = this.getViewport();
    const {
      resources: { source },
    } = this.state;
    const self = this;
    return this.appendJSXs(
      datas
        .map(function loadData(data): any {
          const { componentId, jsxId, children, name } = data;

          let jsx!: ScenaJSXElement;

          if (jsxId) {
            // 查找注册过的元素jsx
            jsx = viewport.getJSX(jsxId);
          }
          if (!jsx) {
            if (componentId) {
              // 当前不存在元素，并且是组件的，去获取到存储的组件方法
              const CompInner = source[name];
              const Component = self.getScenaComponent(name, CompInner);
              // 这里没有传入组件属性，只是进行了渲染？todo
              jsx = <Component />;
            } else {
              // 不是组件的，依据标签创建
              jsx = React.createElement(data.tagName);
            }
          }
          return {
            ...data,
            children: children.map(loadData),
            jsx,
          };
        })
        .filter((info) => info) as ElementInfo[],
    );
  }

  // 成组
  public group() {
    const targets = this.getSelectedTargets();
    const rect = this.getMoveable().getRect();
    const datas = this.saveTargets(targets);
    // 都需要根据成组元素列表的位置大小进行计算，这个可以用moveable的rect得到
    const left = rect.left;
    const top = rect.top;
    const style = {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      'z-index': `${getMaxZIdx(this) + 1}`,
    };
    const childrenSchema = datas.map((item) => {
      const { top: topStr, left: leftStr } = item.frame;
      const frame = {
        ...item.frame,
        // 子元素要相对父级移动位置
        top: `${+topStr.replace('px', '') - top}px`,
        left: `${+leftStr.replace('px', '') - left}px`,
      };
      return {
        ...(item || {}),
        frame,
      };
    });

    this.loadSchemes([
      {
        name: 'Group',
        attrs: {},
        tagName: 'div',
        children: childrenSchema,
        frame: style,
      },
    ]);
    this.removeElements(targets);
  }

  // 解组，针对单个组合
  public deGroup() {
    const targets = this.getSelectedTargets();
    const maxZIdx = getMaxZIdx(this);
    const rect = this.getMoveable().getRect();
    const left = rect.left;
    const top = rect.top;
    const { children } = this.saveTargets(targets)[0];
    const childrenSchemas = children
      .sort((a, b) => {
        const aZIdx = +a.frame['z-index'];
        const bZIdx = +b.frame['z-index'];
        return aZIdx - bZIdx;
      })
      .map((item, idx: number) => {
        const { frame: currFrame } = item;
        const { top: topStr, left: leftStr } = currFrame;
        const frame = {
          ...item.frame,
          // 子元素要相对父级移动位置
          top: `${+topStr.replace('px', '') + top}px`,
          left: `${+leftStr.replace('px', '') + left}px`,
          // 需要将元素创建在maxzindex层级以上
          'z-index': `${maxZIdx + idx + 1}`,
        };
        return {
          ...(item || {}),
          frame,
        };
      });
    this.loadSchemes(childrenSchemas);
    this.removeElements(targets);
  }

  // 拖到元素上面回调，这个只是为了搭配onDrop，没有的话不生效
  public onDragOver(ev: any) {
    ev.preventDefault();
  }

  // 获取选中的元素
  public getSelectedTargets() {
    return this.state.selectedTargets;
  }

  // 获取第二级祖元素（因只有第二级的才能被选中）
  public getSecondLevelParentEles(targets: Array<HTMLElement | SVGElement>) {
    const viewport = this.getViewport();
    const l = targets.map((item) => {
      let info = viewport.getInfoByElement(item);
      while (info && info.scopeId !== 'viewport') {
        if (info.scopeId) {
          info = viewport.ids[info.scopeId];
        }
      }
      return info.id ? viewport.getElement(info.id) : null;
    });
    return Array.from(new Set(l)).filter((item) => item);
  }

  // 设置选中的元素
  public setSelectedTargets(
    targets: Array<HTMLElement | SVGElement>,
    isRestore?: boolean,
  ) {
    // 为了使元素是平级peer的，后代的不要放到里面，因为父级包括了后代
    // 如果是子级的不应该被选中，应该进行解组
    targets = targets.filter((target) => {
      const info = this.getViewport().getInfoByElement(target);
      return (
        info.scopeId === 'viewport' &&
        targets.every((parnetTarget) => {
          return parnetTarget === target || !parnetTarget.contains(target);
        })
      );
    });
    console.log(targets, 'setSelectedTargets');

    // 设置选中元素
    return this.promiseState({
      selectedTargets: targets,
    }).then(() => {
      if (!isRestore) {
        // 先前选中的元素
        const prevs = getIds(this.moveableData.getSelectedTargets());
        // 后面选中的元素
        const nexts = getIds(targets);

        // 判断是不同的（先前选中长度不等于之后选中长度 || 不是所有元素都是相同的）
        if (
          prevs.length !== nexts.length ||
          !prevs.every((prev, i) => nexts[i] === prev)
        ) {
          // 设置前后记录
          this.historyManager.addAction('selectTargets', { prevs, nexts });
        }
      }
      // 拖动框设置选中元素
      this.selecto.current!.setSelectedTargets(targets);
      // moveable设置选中元素
      this.moveableData.setSelectedTargets(targets);
      // 触发元素选中事件，这里相当于右侧panel的一个reset。先隐藏
      // this.eventBus.trigger('setSelectedTargets');

      return targets;
    });
  }

  // 依据info进行添加单个元素
  public appendJSX(info: ElementInfo) {
    return this.appendJSXs([info]).then((targets) => targets[0]);
  }

  // 依据infos进行批量元素添加,新建元素
  public appendJSXs(
    jsxs: ElementInfo[],
    isRestore?: boolean,
  ): Promise<Array<HTMLElement | SVGElement>> {
    const viewport = this.getViewport();
    // 获取已选中元素的idx列表
    const indexesList = viewport.getSortedIndexesList(
      this.getSelectedTargets(),
    );
    const indexesListLength = indexesList.length;
    let appendIndex = -1;
    let scopeId: string = '';
    // 不是恢复，传入了info的
    if (!isRestore && indexesListLength) {
      // 取最后一个
      const indexes = indexesList[indexesListLength - 1];

      //
      const info = viewport.getInfoByIndexes(indexes);

      scopeId = info.scopeId!;
      appendIndex = indexes[indexes.length - 1] + 1;
    }

    this.console.log('append jsxs', jsxs, appendIndex, scopeId);

    return this.getViewport()
      .appendJSXs(jsxs, appendIndex, scopeId)
      .then(({ added }) => {
        return this.appendComplete(added, isRestore);
      });
  }

  public appendComplete(infos: ElementInfo[], isRestore?: boolean) {
    !isRestore &&
      this.historyManager.addAction('createElements', {
        infos,
        prevSelected: getIds(this.getSelectedTargets()),
      });
    const data = this.moveableData;
    const targets = infos
      .map(function registerFrame(info) {
        data.createFrame(info.el!, info.frame);
        data.render(info.el!);

        info.children!.forEach(registerFrame);
        return info.el!;
      })
      .filter((el) => el);

    return Promise.all(targets.map((target) => checkImageLoaded(target))).then(
      () => {
        this.setSelectedTargets(targets, true);

        return targets;
      },
    );
  }

  public removeByIds(ids: string[], isRestore?: boolean) {
    return this.removeElements(this.getViewport().getElements(ids), isRestore);
  }

  // 获取主moveable实例
  public getMoveable() {
    return this.moveableManager.current!.getMoveable();
  }

  // 移除元素样式，返回移除的样式，用于恢复
  public removeFrames(targets: Array<HTMLElement | SVGElement>) {
    const frameMap: IObject<any> = {};
    const moveableData = this.moveableData;
    const viewport = this.getViewport();

    targets.forEach(function removeFrame(target) {
      const info = viewport.getInfoByElement(target)!;
      frameMap[info.id!] = moveableData.getFrame(target).get();
      // 移除元素样式
      moveableData.removeFrame(target);

      info.children!.forEach((childInfo) => {
        removeFrame(childInfo.el!);
      });
    });

    return frameMap;
  }

  // 恢复frames
  public restoreFrames(infos: ElementInfo[], frameMap: IObject<any>) {
    const viewport = this.getViewport();
    const moveableData = this.moveableData;

    // 给info设置之前的frame
    infos.forEach(function registerFrame(info) {
      info.frame = frameMap[info.id!];
      delete frameMap[info.id!];

      info.children!.forEach(registerFrame);
    });
    // 给元素创建frame
    for (const id in frameMap) {
      moveableData.createFrame(viewport.getInfo(id).el!, frameMap[id]);
    }
  }

  // 移除元素
  public removeElements(
    targets: Array<HTMLElement | SVGElement>,
    isRestore?: boolean,
  ) {
    const viewport = this.getViewport();
    // 移除元素frame-样式，返回了frame，用于恢复
    const frameMap = this.removeFrames(targets);
    // 移除元素的下标链
    const indexesList = viewport.getSortedIndexesList(targets);
    const indexesListLength = indexesList.length;
    let scopeId = '';
    let selectedInfo: ElementInfo | null = null;

    if (indexesListLength) {
      // 存在选中的元素，获取最后一个选中元素的信息
      const lastInfo = viewport.getInfoByIndexes(
        indexesList[indexesListLength - 1],
      );
      // 选中元素的下一个元素信息
      const nextInfo = viewport.getNextInfo(lastInfo.id!);

      scopeId = lastInfo.scopeId!;
      // 令选中元素成为下一个元素
      selectedInfo = nextInfo;
    }
    // return;
    return viewport.removeTargets(targets).then(({ removed }) => {
      // 在删除掉本元素后，要设定下一个选中元素
      const selectedTarget =
        selectedInfo ||
        viewport.getLastChildInfo(scopeId)! ||
        viewport.getInfo(scopeId);

      this.setSelectedTargets(
        selectedTarget && selectedTarget.el ? [selectedTarget.el!] : [],
        true,
      );

      this.console.log('removeTargets', removed);
      !isRestore &&
        this.historyManager.addAction('removeElements', {
          infos: removed.map(function removeTarget(
            info: ElementInfo,
          ): ElementInfo {
            return {
              ...info,
              children: info.children!.map(removeTarget),
              frame: frameMap[info.id!] || info.frame,
            };
          }),
        });
      return targets;
    });
  }

  public setProperty(scope: string[], value: any, isUpdate?: boolean) {
    const infos = this.moveableData.setProperty(scope, value);

    this.historyManager.addAction('renders', { infos });

    if (isUpdate) {
      this.moveableManager.current!.updateRect();
    }
    this.eventBus.requestTrigger('render');
  }

  public setOrders(scope: string[], orders: NameType[], isUpdate?: boolean) {
    const infos = this.moveableData.setOrders(scope, orders);

    this.historyManager.addAction('renders', { infos });

    if (isUpdate) {
      this.moveableManager.current!.updateRect();
    }
    this.eventBus.requestTrigger('render');
  }

  public selectMenu(menu: string) {
    this.menu.current!.select(menu);
  }

  // 这里只进行已有组件的复制粘贴等加载，暂不能进行重新进入的数据加载
  public loadDatas(datas: SavedScenaData[]) {
    const viewport = this.getViewport();
    return this.appendJSXs(
      datas
        .map(function loadData(data): any {
          const { componentId, jsxId, children } = data;

          let jsx!: ScenaJSXElement;

          if (jsxId) {
            // 查找注册过的元素jsx
            jsx = viewport.getJSX(jsxId);
          }
          if (!jsx) {
            if (componentId) {
              // 当前不存在元素，并且是组件的，去获取到存储的组件方法
              // 但是本身component没有被加载就没法创建
              const Component = viewport.getComponent(componentId);

              // 这里没有传入组件属性，只是进行了渲染？todo
              jsx = <Component />;
            } else {
              // 不是组件的，依据标签创建

              jsx = React.createElement(data.tagName);
            }
          }
          return {
            ...data,
            children: children.map(loadData),
            jsx,
          };
        })
        .filter((info) => info) as ElementInfo[],
    );
  }

  // 这里保存画布所有子元素的json结构到localStorage，没有保存容器层
  public saveAll() {
    const viewport = this.getViewport();
    const eles = viewport.getViewportInfos().map((item) => item.el);
    localStorage.setItem('jsonObj', JSON.stringify(this.saveTargets(eles)));
    // this.console.log(this.saveTargets(eles));
  }

  // 产出画布元素的json结构
  public saveTargets(
    targets: Array<HTMLElement | SVGElement>,
  ): SavedScenaData[] {
    const viewport = this.getViewport();
    const moveableData = this.moveableData;
    this.console.log('save targets', targets);
    return (
      targets
        // 通过元素获取info
        .map((target) => viewport.getInfoByElement(target))
        .map(function saveTarget(info): SavedScenaData {
          const target = info.el!;
          // 是否可编辑的
          const isContentEditable = info.attrs?.contenteditable;
          // 生成的最终结构
          return {
            // 组件名称
            name: info.name,
            // 获取除id和style的元素attrs
            attrs: getScenaAttrs(target),
            // 似乎就是id
            jsxId: info.jsxId || '',
            componentId: info.componentId!,
            // 会包含元素的html
            innerHTML: isContentEditable ? '' : target.innerHTML,
            // 不包含元素的html，只有content内容
            innerText: isContentEditable
              ? (target as HTMLElement).innerText
              : '',
            // 元素标签
            tagName: target.tagName.toLowerCase(),
            // 获取所有样式属性
            frame: moveableData.getFrame(target).get(),
            dataV: info.dataV,
            // 子级遍历
            children: info.children!.map(saveTarget),
          };
        })
    );
  }

  public getViewport() {
    return this.viewport.current!;
  }

  public getViewportInfos() {
    return this.getViewport().getViewportInfos();
  }

  // 图片元素的新增
  public appendBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);

    return this.appendJSX({
      jsx: <img src={url} alt="appended blob" />,
      name: '(Image)',
    });
  }

  // 主要用于移动恢复的
  public moves(movedInfos: MovedInfo[], isRestore?: boolean) {
    // 移除元素frames
    const frameMap = this.removeFrames(movedInfos.map(({ info }) => info.el!));

    return this.getViewport()
      .moves(movedInfos)
      .then((result) => this.moveComplete(result, frameMap, isRestore));
  }

  private onMenuChange = (id: string) => {
    this.setState({
      selectedMenu: id,
    });
  };

  // 用于menu里面一些元素的创建
  private selectEndMaker(rect: Rect) {
    const infiniteViewer = this.infiniteViewer.current!;
    const selectIcon = this.menu.current!.getSelected();
    const width = rect.width;
    const height = rect.height;
    if (!selectIcon || !selectIcon.maker || !width || !height) {
      return false;
    }
    const maker = selectIcon.maker(this.memory);
    const scrollTop = -infiniteViewer.getScrollTop() + 30;
    const scrollLeft = -infiniteViewer.getScrollLeft() + 75;
    const top = rect.top - scrollTop;
    const left = rect.left - scrollLeft;

    const style = {
      top: `${top}px`,
      left: `${left}px`,
      position: 'absolute',
      width: `${width}px`,
      height: `${height}px`,
      ...maker.style,
    } as any;
    this.appendJSX({
      jsx: maker.tag,
      attrs: maker.attrs,
      name: `(${selectIcon.id})`,
      frame: style,
    }).then(selectIcon.makeThen);
    return true;
  }

  // moveable进行移动，px
  private move(deltaX: number, deltaY: number) {
    this.getMoveable().request('draggable', { deltaX, deltaY }, true);
  }

  private checkBlur() {
    const activeElement = document.activeElement;
    if (activeElement) {
      (activeElement as HTMLElement).blur();
    }
    const selection = document.getSelection()!;

    if (selection) {
      selection.removeAllRanges();
    }
    this.eventBus.trigger('blur');
  }

  private onResize = () => {
    this.horizontalGuides.current!.resize();
    this.verticalGuides.current!.resize();
  };

  private onBlur = (e: any) => {
    const target = e.target as HTMLElement | SVGElement;
    if (!checkInput(target)) {
      return;
    }
    const parentTarget = getParnetScenaElement(target);

    if (!parentTarget) {
      return;
    }
    const info = this.getViewport().getInfoByElement(parentTarget)!;

    if (!info.attrs!.contenteditable) {
      return;
    }
    const nextText = (parentTarget as HTMLElement).innerText;

    if (info.innerText === nextText) {
      return;
    }
    this.historyManager.addAction('changeText', {
      id: info.id,
      prev: info.innerText,
      next: nextText,
    });
    info.innerText = nextText;
  };

  // 其实可以认为是组合，但是这种组合方法不符合要求，得另外写一个
  private moveInside() {
    let targets = this.getSelectedTargets();

    const length = targets.length;
    // 只有一个元素则返回
    if (length !== 1) {
      return;
    }
    // 多个元素下拿到第一个元素
    targets = [targets[0]];

    const viewport = this.getViewport();
    // 移除选中元素的frame
    const frameMap = this.removeFrames(targets);

    return viewport
      .moveInside(targets[0])
      .then((result) => this.moveComplete(result, frameMap));
  }

  private moveOutside() {
    let targets = this.getSelectedTargets();

    const length = targets.length;
    if (length !== 1) {
      return;
    }
    targets = [targets[0]];

    const frameMap = this.removeFrames(targets);
    this.getViewport()
      .moveOutside(targets[0])
      .then((result) => this.moveComplete(result, frameMap));
  }

  // 恢复frame，记录move历史
  private moveComplete(
    result: MovedResult,
    frameMap: IObject<any>,
    isRestore?: boolean,
  ) {
    this.console.log('Move', result);

    const { moved, prevInfos, nextInfos } = result;
    // 恢复frame
    this.restoreFrames(moved, frameMap);

    if (moved.length) {
      if (!isRestore) {
        // 记录move操作
        this.historyManager.addAction('move', {
          prevInfos,
          nextInfos,
        });
      }
      // move complete
      this.appendComplete(moved, true);
    }

    return result;
  }
}
