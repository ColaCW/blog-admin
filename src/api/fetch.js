import axios from 'axios';
import router from '@/router/index.js';
import { removeToken, removeUser, getToken } from '@/assets/js/auth.js';
import { Notification } from 'element-ui';

const codeMessage = {
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
  504: '网关超时。'
};

const instance = axios.create({
  timeout: 20000,
  withCredentials: true // 跨域请求时是否需要使用凭证
});

// 异常处理程序
const errorHandler = error => {
  const { response = {} } = error;
  const errortext = codeMessage[response.data.resultCode];
  Notification.error({
    title: `${response.data.message}`,
    message: errortext
  });
  // token无效或者过期，跳至登录界面
  if (response.data.resultCode === 401) {
    removeToken();
    removeUser();
    setTimeout(() => router.push({ path: '/login' }), 100);
  }
  return Promise.reject(error);
};

// 请求拦截
instance.interceptors.request.use(config => {
  // 请求头信息，token 验证
  config.headers = {
    jwt: getToken(),
    userAgent: 'pc'
  };
  return config;
}, errorHandler);

// 响应拦截
instance.interceptors.response.use(({ data }) => {
  if (data.resultCode === 200 || data.status === 200) {
    return data;
  }
}, errorHandler);

export default instance;
