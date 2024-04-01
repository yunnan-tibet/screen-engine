interface IStatisticConfig {
  id: string;
  name: string;
  desc: string;
  img: string;
  groupName: string;
  property: IProperty;
  children: IStatisticConfig[];
  type?: 'layout';
  config?: IStatisticConfig[];
}

interface IProperty {
  [key: string]: IPropertyItem;
}

interface IPropertyItem {
  label: string;
  value: string;
}

interface IStaTemp {
  id?: string;
  configId?: string;
  picture?: string;
  jsonCode?: string;
  config?: IStatisticConfig[];
}

interface IGetTempListParams extends ICommonListParams {
  name?: string;
}

interface IGetPageListParams extends ICommonListParams {
  name?: string;
}

interface IPageItem {
  id?: string;
  name?: string;
  keyCode?: string;
  model?: IStaTemp;
}
