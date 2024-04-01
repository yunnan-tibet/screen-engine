import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Editor from '../Editor';
import { prefix } from '../utils/utils';
import { MENU_OPERATE, MENU_TYPE } from './config';
import styles from './index.less';

interface IProps {
  editor: Editor;
}

export interface IRightClickMenuRef {}

const RightClickMenu = forwardRef<IRightClickMenuRef, IProps>((props, ref) => {
  const { editor } = props;
  const menuRef = useRef<any>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [menuOperates, setMenuOperates] = useState<number[]>([]);

  const getCompELeFromBottom = (ele: HTMLElement) => {
    let _ele = ele;
    let dseId;
    let resEle;
    while (_ele) {
      // 首先要找到组件，再去判断是否为顶级，不是的也继续往上找
      dseId = _ele.getAttribute('data-scena-element-id');
      if (dseId) {
        const parentEle = _ele.parentElement;
        const pId = parentEle?.getAttribute('data-scena-element-id');
        if (pId === 'viewport') {
          resEle = _ele;
          break;
        }
      }
      _ele = _ele.parentElement as HTMLElement;
    }
    return { ele: resEle, dseId };
  };

  /**
   * 处理三种类型，1.画布2.多元素3.分组4.单组件元素
   */
  const onRightClick = useCallback(
    (ev) => {
      const { clientX, clientY, target } = ev;
      let chooseType: number = 0;
      let _targetEles: (HTMLElement | SVGElement)[] = [];
      // viewport内所有的元素，备用
      const viewport = editor.getViewport();
      const infos = viewport.getViewportInfos();
      // target选中
      if (target.className === 'moveable-area') {
        // 代表目前已经是选中了元素，可能选中多个
        _targetEles = editor.getSelectedTargets();
      } else if (target.className === 'scena-viewport') {
        // 代表选中画布，暂不处理
        _targetEles = editor.getSelectedTargets();
        chooseType = MENU_TYPE.VIEWPORT;
        return;
      } else {
        // 没选中元素，右键点击，那只会选中一个
        // 去寻找data-scena-element-id，如果没有那不要处理
        const { ele } = getCompELeFromBottom(target);
        if (ele) {
          // 代表找到了
          _targetEles = [ele];
          editor.setSelectedTargets(_targetEles);
        } else {
          // 其他的情况，不做右键处理
          return;
        }
      }

      if (_targetEles.length > 1) {
        // 有多个
        chooseType = MENU_TYPE.MULT_ELE;
      } else {
        const info = viewport.getInfoByElement(_targetEles[0]);
        if (info.children && info.children.length) {
          // 是分组
          chooseType = MENU_TYPE.GROUP;
        } else {
          // 是单个
          chooseType = MENU_TYPE.SINGLE_ELE;
        }
      }

      if (chooseType) {
        ev.preventDefault();
        if (chooseType !== MENU_TYPE.VIEWPORT) {
          editor.setSelectedTargets(_targetEles);
        }
        setMenuOperates(MENU_TYPE.toMenuL(chooseType));
        // 菜单展示以及位置配置等
        setMenuStyle({
          display: 'block',
          top: `${clientY}px`,
          left: `${clientX}px`,
        });
        menuRef.current.focus();
      }
    },
    [menuRef],
  );

  useEffect(() => {
    // 监听右键点击事件
    window.addEventListener('contextmenu', onRightClick);
    return () => {
      window.removeEventListener('contextmenu', onRightClick);
    };
  }, [onRightClick]);

  const onBlur = () => {
    setMenuStyle({
      display: 'none',
    });
  };

  return (
    <div className={styles.rightClickMenu}>
      <div
        tabindex={0}
        onBlur={onBlur}
        className={styles.menu}
        ref={menuRef}
        style={menuStyle}
      >
        {menuOperates.map((key: number) => {
          const func = MENU_OPERATE.toFunc(key, editor);
          return (
            <div
              onClick={() => {
                func && func();
                onBlur();
              }}
              key={key}
              className={styles.item}
            >
              <div className={styles.name}>{MENU_OPERATE.toString(key)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default RightClickMenu;
