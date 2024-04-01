type IResponse<T> = Promise<[Error | null, T]>;

// 容器基本属性
interface IBaseWrapperProps {
  className?: string;
}

interface IRequestParams {
  [key: string]: any;
}
