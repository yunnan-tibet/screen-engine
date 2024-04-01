import React from 'react';
import Editor from '../Editor';
import { IResources } from '../types';
import { prefix } from '../utils/utils';
import './index.less';

export default class CompPanel extends React.PureComponent<{
  editor: Editor;
  resources: IResources;
}> {
  private onDragStart(ev: any, config: IStatisticConfig) {
    ev.dataTransfer.setData('data', JSON.stringify(config));
  }

  public render() {
    const {
      resources: { schema },
    } = this.props;
    const compL = Object.keys(schema).map((key) => ({ ...schema[key] }));

    return (
      <div className={prefix('comp-panel')}>
        <div className={prefix('comp-panel-list')}>
          {compL.map((item: any) => {
            const { name, desc, img } = item;
            return (
              <div key={name} className={prefix('comp-panel-list-item')}>
                <div className={prefix('comp-panel-list-item-name')}>
                  {desc}
                </div>
                <img
                  draggable
                  onDragStart={(ev) => this.onDragStart(ev, item)}
                  src={img}
                  className={prefix('comp-panel-list-item-img')}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
