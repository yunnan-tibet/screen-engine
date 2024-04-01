/**
 * request 网络请求工具
 * 经过一层返回的封装，使用方式为：
 * const [err, data] = await XxxService.getXXX();
 * // 如果没有错误，err为null
 * if (!err) {
 *  // 后续处理
 * }
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend, ResponseError, RequestOptionsWithResponse } from 'umi-request';
import { getDvaApp } from 'umi';

interface ICodeMessageType {
  [key: number]: string;
}

interface IRequest {
  url: string;
  data?: any;
  params?: any;
  fileName?: string;
  options?: RequestOptionsWithResponse;
}

interface ISendOptions {
  url: string;
  params: any;
}

const codeMessage: ICodeMessageType = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  const { response } = error;
  if (response && response.status) {
    // 浏览器报的错误码
    const { status: code } = response;
    const errorText = codeMessage[code] || response.statusText;
    const store = getDvaApp()._store;
    const { dispatch } = store;
    switch (code) {
      case 401:
        dispatch({
          type: 'user/clear',
        });
        break;
      default:
    }
    return Promise.reject({ code, errorText });
  }
  return Promise.resolve(response);
};

/**
 * 配置request请求时的默认参数
 */
const originRequest: any = extend({
  errorHandler,
});

function downloadFile(blob: Blob, filename?: string) {
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(
    new Blob([blob], { type: 'application/vnd.ms-excel' }),
  );
  a.href = url;
  a.download = filename;
  a.click();
  a.parentElement?.removeChild(a);
}

const awaitTo: any = (promise: Promise<any>) => {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err: Error) => {
      return [err, null];
    });
};
const fetchRequest = (
  method: any,
  url: string,
  options?: RequestOptionsWithResponse,
) => {
  return awaitTo(
    originRequest[method](url, {
      ...options,
      headers: { ...options?.headers },
    }),
  );
};
// 如果需要的话，可以继续加其他的方法
const request = {
  get: ({ url, data, params, options }: IRequest) => {
    return fetchRequest('get', url, {
      ...(options || {}),
      data,
      params,
    } as any);
  },
  post: ({ url, data, params, options }: IRequest) => {
    return fetchRequest('post', url, {
      ...(options || {}),
      data,
      params,
    } as any);
  },
  // post download需要和download1合并优化，现在download因为没拿response header的文件名字只能设置一个固定名字
  download: ({ url, data, params, options, fileName }: IRequest) => {
    const download = new Promise((resolve, reject) => {
      fetchRequest('post', url, {
        ...(options || {}),
        responseType: 'blob',
        headers: {
          ...(options?.Headers || []),
        },
        data,
        params,
      } as any)
        .then((_data: any[]) => {
          downloadFile(_data[1], fileName);
          resolve(_data[1]);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
    return awaitTo(download);
  },
  /**
  * 根据内容文件流导出，xhr，有文件名，没有做catch处理
  * @param url
  * @param param
  * @param fileName
  */
  download1: (url: string, params: any, fileName?: string) => {
    return new Promise((resolve, reject) => {
      const xmlResquest = new XMLHttpRequest();
      xmlResquest.open('post', url, true);
      xmlResquest.setRequestHeader('Content-type', 'application/json');
      xmlResquest.setRequestHeader(
        'user-id',
        sessionStorage.getItem('userId') as string,
      );
      xmlResquest.responseType = 'blob';
      xmlResquest.onload = () => {
        if (xmlResquest.status === 200) {
          const content = xmlResquest.response;
          const elink = document.createElement('a');
          const disposition =
            xmlResquest.getResponseHeader('Content-disposition') || '';
          // 返回头文件名和格式
          const name = 'filename=';
          const info = disposition.slice(disposition.indexOf(name) + name.length);
          // 将code码转成中文，设置下载文件名
          elink.download = `${fileName || ''}${decodeURI(info)}`;
          elink.style.display = 'none';
          const blob = new Blob([content], {
            type: 'application/vnd.ms-excel;charset=utf-8',
          });
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          document.body.removeChild(elink);
          resolve({ code: 200 });
        } else {
          reject(xmlResquest.responseText);
        }
      };
      xmlResquest.send(JSON.stringify(params));
    });
  },
  /**
   * 2步文件上传专用，传入File类型转为binary
   * @param ISendOptions
   * 备注：umi的form-File类型转换会出问题，不知道咋回事
   */
  sendFile: ({ url, params }: ISendOptions) => {
    return awaitTo(
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const _data = new FormData();
        Object.keys(params).forEach((key: string) => {
          _data.append(key, params[key]);
        });
        xhr.onload = function () {
          if (xhr.status === 200) {
            const uploadData = JSON.parse(xhr.responseText);
            if (uploadData.code === 200) {
              resolve(uploadData);
            } else {
              reject(uploadData);
            }
          } else {
            reject(xhr.responseText);
          }
        };
        xhr.open('post', url, true);
        xhr.setRequestHeader(
          'user-id',
          sessionStorage.getItem('userId') as string,
        );
        xhr.send(_data);
      }),
    );
  }
};

export default request;
