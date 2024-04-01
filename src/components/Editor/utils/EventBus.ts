import Component from '@egjs/component';
import { IObject } from '@daybrush/utils';

class EventBus extends Component {
  private eventMap: IObject<number> = {};

  requestTrigger(name: string, params: IObject<any> = {}) {
    const eventMap = this.eventMap;
    // requestAnimationFrame的取消
    cancelAnimationFrame(eventMap[name] || 0);

    eventMap[name] = requestAnimationFrame(() => {
      this.trigger(name, params);
    });
  }
}
export default EventBus;
