import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IObject, isArray, isString } from '@daybrush/utils';
import classNames from 'classnames';
import { ScenaJSXElement } from '@/components/Editor/types';
import { ElementInfo } from '@/components/Editor/Viewport/Viewport';
import { DATA_SCENA_ELEMENT_ID } from '@/components/Editor/consts';
import { getResources } from '@/components/Editor/utils/statisticConfig';
import styles from './index.less';

const TYPES = {
  CENTER: 'CENTER',
  TOP: 'TOP',
  VALUES: ['CENTER', 'TOP'],
  toString: (v: string) => {
    switch (v) {
      case TYPES.CENTER:
        return '按宽高缩';
      case TYPES.TOP:
        return '按宽缩';
      default:
        return '';
    }
  },
};

const jsxs = JSON.parse(localStorage.getItem('jsonObj') || '{}');
export default function Page() {
  console.log(jsxs, 'jsxs');
  const [type, setType] = useState(TYPES.CENTER);
  const [scaleNum, setScaleNum] = useState(1);
  // 源代码组件
  const [sources, setSources] = useState<any>({});
  useEffect(() => {
    getRs();
  }, []);

  // 获取组件资源
  const getRs = () => {
    const context = require.context(
      '../../../components/StatisticComps',
      true,
      /^\.\/\w+\/(index\.(j|t)sx?|package.json)$/,
    );
    const { src } = getResources(context);
    setSources(src);
  };

  const onresize = useCallback(() => {
    let scaleNum: number = 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === 0 || h === 0) {
      setTimeout(onresize, 100);
      return;
    }
    const rateW = w / 1920;
    const rateH = h / 1080;
    if (type === TYPES.CENTER) {
      if (rateW < rateH) {
        scaleNum = rateW;
      } else {
        scaleNum = rateH;
      }
    } else if (type === TYPES.TOP) {
      scaleNum = rateW;
    }

    setScaleNum(scaleNum);
  }, [type]);

  useEffect(() => {
    onresize();
    window.addEventListener('resize', onresize);
    return () => {
      window.removeEventListener('resize', onresize);
    };
  }, [onresize]);

  const renderChildren = useCallback(
    (children: ElementInfo[]): ScenaJSXElement[] => {
      return children.map((info) => {
        const {
          transform: { scale, rotate, translate },
        } = info.frame;
        const CompInner = sources[info.componentId!];
        const nextChildren = info.children!;
        const renderedChildren = renderChildren(nextChildren);
        const id = info.id!;
        const props: IObject<any> = {
          key: id,
          style: {
            ...info.frame,
            transform: `translate(${translate}) rotate(${rotate}) scale(${scale})`,
          },
        };
        props[DATA_SCENA_ELEMENT_ID] = id;
        const Comp = (props) => {
          return (
            <div style={props.style}>
              <CompInner />
            </div>
          );
        };
        return React.createElement(
          Comp,
          props,
          ...renderedChildren,
        ) as ScenaJSXElement;
      });
    },
    [sources],
  );

  const renderedChildren = useMemo(() => {
    if (Object.keys(sources).length) {
      return renderChildren(jsxs);
    }
    return '';
  }, [jsxs, renderChildren]);

  return (
    <div className={classNames(styles.container, styles[`f${type}`])}>
      <div
        className={styles.contentWrapper}
        style={{ transform: `scale(${scaleNum})` }}
      >
        <div className={styles.content}>{renderedChildren}</div>
      </div>
      <div
        className={styles.floatBtn}
        onClick={() => {
          const idx = TYPES.VALUES.findIndex((key) => key === type);
          setType(
            idx === TYPES.VALUES.length - 1
              ? TYPES.VALUES[0]
              : TYPES.VALUES[idx + 1],
          );
        }}
      >
        {TYPES.toString(type)}
      </div>
    </div>
  );
}
