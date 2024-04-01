import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button } from 'antd';
import ContentWrapper from '@/components/ContentWrapper';
import styles from './index.less';
import Editor, { makeScenaFunctionComponent } from '@/components/Editor';
import { ScenaProps } from '@/components/Editor/types';

const MyButton = makeScenaFunctionComponent(
  'MyButton',
  function MyButton(props: ScenaProps) {
    return (
      <div
        style={{ display: 'inline-block' }}
        data-scena-element-id={props.scenaElementId}
      >
        <Button>23234</Button>
      </div>
    );
  },
);

export default function Page() {
  const editor = useRef<Editor>(null);

  return <Editor ref={editor} debug />;
}
