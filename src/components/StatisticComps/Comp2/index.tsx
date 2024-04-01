import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { option } from './config';

const Comp2 = () => {
  const [id] = useState<any>(Math.random());
  useEffect(() => {
    const chartDom = document.getElementById(id) as HTMLElement;
    const myChart = echarts.init(chartDom);
    myChart.setOption(option);
    const resizeObserver = new ResizeObserver(() => {
      myChart.resize();
    });

    if (chartDom) {
      resizeObserver.observe(chartDom.parentElement!);
    }

    return () => {
      resizeObserver.disconnect();
      myChart.dispose();
    };
  }, [id]);
  return <div id={id} style={{ height: '100%', width: `100%` }} />;
};

export default React.memo(Comp2);
