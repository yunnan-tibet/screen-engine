import { Frame } from 'scenejs';
import Editor from '../Editor';
import MoveableData from '../utils/MoveableData';
import { getMaxZIdx, getMinZIdx } from '../utils/utils';

const MAX_ZIDX = 9999;

export const MENU_OPERATE = {
  UP: 1,
  DOWN: 2,
  TOP: 3,
  BOTTOM: 4,
  UNIT: 5,
  UNUNIT: 6,
  DEL: 7,
  toString: (v: number) => {
    switch (v) {
      case MENU_OPERATE.UP:
        return '上移';
      case MENU_OPERATE.DOWN:
        return '下移';
      case MENU_OPERATE.TOP:
        return '置顶';
      case MENU_OPERATE.BOTTOM:
        return '置底';
      case MENU_OPERATE.UNIT:
        return '成组';
      case MENU_OPERATE.UNUNIT:
        return '解组';
      case MENU_OPERATE.DEL:
        return '删除';
      default:
        return '';
    }
  },
  toFunc: (v: number, editor: Editor) => {
    const infos = editor.getViewportInfos();
    const data = editor.moveableData;
    const viewport = editor.getViewport();
    switch (v) {
      case MENU_OPERATE.UP:
        return () => {
          const ele = editor.getSelectedTargets()[0];
          const currIdx = +ele.style.zIndex;
          let maxZIdx = 1;
          let prevFrame: Frame | undefined;
          let prevZIdx = MAX_ZIDX;
          let currFrame: Frame | undefined;
          infos.forEach((item) => {
            const frame = data.getFrame(
              viewport.getElement(item.id as string) as HTMLElement,
            );
            const _zIdx = +frame.get('z-index');
            if (maxZIdx <= _zIdx) {
              // 寻找最大的zidx，有可能就是本身
              maxZIdx = _zIdx;
            }

            if (currIdx < _zIdx) {
              if (prevZIdx >= _zIdx) {
                // 寻找上一个zidx
                prevZIdx = _zIdx;
                prevFrame = frame;
              }
            }

            if (currIdx === _zIdx) {
              currFrame = frame;
            }
          });

          if (prevFrame && currFrame && currIdx !== maxZIdx) {
            prevFrame.set('z-index', `${currIdx}`);
            currFrame.set('z-index', `${prevZIdx}`);
          }
          data.renderAllFrames();
        };
      case MENU_OPERATE.DOWN:
        return () => {
          const ele = editor.getSelectedTargets()[0];
          const currIdx = +ele.style.zIndex;
          let minZIdx = 1;
          let nextFrame: Frame | undefined;
          let nextZIdx = 1;
          let currFrame: Frame | undefined;
          infos.forEach((item) => {
            const frame = data.getFrame(
              viewport.getElement(item.id as string) as HTMLElement,
            );

            const _zIdx = +frame.get('z-index');
            if (minZIdx >= _zIdx) {
              // 寻找最大的zidx，有可能就是本身
              minZIdx = _zIdx;
            }

            if (currIdx > _zIdx) {
              if (nextZIdx <= _zIdx) {
                // 寻找上一个zidx
                nextZIdx = _zIdx;
                nextFrame = frame;
              }
            }

            if (currIdx === _zIdx) {
              currFrame = frame;
            }
          });
          if (nextFrame && currFrame && currIdx !== minZIdx) {
            nextFrame.set('z-index', `${currIdx}`);
            currFrame.set('z-index', `${nextZIdx}`);
          }
          data.renderAllFrames();
        };
      case MENU_OPERATE.TOP:
        return () => {
          const ele = editor.getSelectedTargets()[0];
          const currIdx = +ele.style.zIndex;
          // 最大的不一定是长度，这个因为在成组的时候没有更新所有的frame
          const maxZIdx = getMaxZIdx(editor);
          if (currIdx !== maxZIdx) {
            infos.forEach((item) => {
              const frame = data.getFrame(
                viewport.getElement(item.id as string) as HTMLElement,
              );
              const _zIdx = +frame.get('z-index');
              if (_zIdx === currIdx) {
                frame.set('z-index', `${maxZIdx}`);
              } else if (_zIdx > currIdx) {
                frame.set('z-index', `${_zIdx - 1}`);
              }
            });
            data.renderAllFrames();
          }
        };
      case MENU_OPERATE.BOTTOM:
        return () => {
          const ele = editor.getSelectedTargets()[0];
          const currIdx = +ele.style.zIndex;
          // 最小的不一定是1
          const minZIdx = getMinZIdx(editor);
          if (currIdx !== minZIdx) {
            infos.forEach((item) => {
              const frame = data.getFrame(
                viewport.getElement(item.id as string) as HTMLElement,
              );
              const _zIdx = +frame.get('z-index');
              if (_zIdx === currIdx) {
                frame.set('z-index', `${minZIdx}`);
              } else if (_zIdx < currIdx) {
                frame.set('z-index', `${_zIdx + 1}`);
              }
            });
            data.renderAllFrames();
          }
        };
      case MENU_OPERATE.UNIT:
        return () => {
          editor.group();
        };
      case MENU_OPERATE.UNUNIT:
        return () => {
          editor.deGroup();
        };
      case MENU_OPERATE.DEL:
        return () => {
          editor.removeElements(editor.getSelectedTargets());
        };
      default:
        return () => {};
    }
  },
};

// 选中类型
export const MENU_TYPE = {
  SINGLE_ELE: 1, // 单组件
  MULT_ELE: 2, // 多组件
  GROUP: 3, // 组合
  VIEWPORT: 4, // 画布
  toMenuL: (v: number) => {
    switch (v) {
      case MENU_TYPE.MULT_ELE:
        return [MENU_OPERATE.UNIT, MENU_OPERATE.DEL];
      case MENU_TYPE.SINGLE_ELE:
        return [
          MENU_OPERATE.UP,
          MENU_OPERATE.DOWN,
          MENU_OPERATE.TOP,
          MENU_OPERATE.BOTTOM,
          MENU_OPERATE.DEL,
        ];
      case MENU_TYPE.GROUP:
        return [MENU_OPERATE.UNUNIT, MENU_OPERATE.DEL];
      case MENU_TYPE.VIEWPORT:
        return [];
      default:
        return [];
    }
  },
};
