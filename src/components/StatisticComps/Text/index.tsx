import classnames from 'classnames';
import React from 'react';
import { CompConfig } from '@/components/Editor/types';
import styles from './index.less';

type ProgressProp = {
  text?: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  textAlign?: {
    horizontal?: any;
    vertical?: string;
  };
  textDirection?: any;
  letterSpacing?: number;
  bg?: {
    bgColor?: string;
    borderRadius?: number;
    border?: string;
  };
  ellipsis?: boolean;
  hyperLink?: {
    link?: string;
    newWindow?: boolean;
  };
  boxShadow?: string;
};

const Text = ({ config, source }: CompConfig<ProgressProp>) => {
  const {
    text,
    fontSize,
    color,
    fontWeight,
    textAlign,
    textDirection,
    letterSpacing,
    bg,
    ellipsis,
    hyperLink,
    boxShadow,
  } = config || {};
  const { vertical, horizontal } = textAlign || {};
  const { bgColor, border, borderRadius } = bg || {};
  const { link, newWindow } = hyperLink || {};
  return (
    <div
      className={classnames(styles.text, ellipsis ? styles[`f-ellipsis`] : '')}
      style={{
        fontWeight,
        fontSize,
        color,
        textAlign: horizontal,
        verticalAlign: vertical,
        writingMode: textDirection,
        letterSpacing,
        backgroundColor: bgColor,
        border,
        boxShadow,
        borderRadius,
      }}
    >
      {link ? (
        <a target={newWindow ? '_blank' : '_self'} href={link} rel="noreferrer">
          {text}
        </a>
      ) : (
        text
      )}
    </div>
  );
};

export default React.memo(Text);
