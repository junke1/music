import axios from 'axios';
axios.defaults.withCredentials = true; //允许跨域携带cookie信息
const instance = axios.create({
  timeout: 1000 * 60,
  // withCredentials 表示跨域请求时是否需要使用凭证
  withCredentials: true,
  // validateStatus 定义对于给定的HTTP 响应码是resolve 或reject promise
  // 如果validateStatus 返回true （或者设置为 null 或undefined）
  // promise 将被resolve 否则将被rejected
  validateStatus: (status) => {
    return status >= 200 && status < 300; //default
  },
  // 这里是整个网站获取数据的根路径
  // 将网易云提供的数据接口挂载到vercel上，部署成功后将路径使用于此
  baseURL: 'https://netease-cloud-music-api-gules-theta.vercel.app/',
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    //对响应错误做点什么
    return Promise.reject(error);
  }
);

const ajaxMethod = ['get', 'post'];
const api = {};
// 往api对象添加get和post两个方法属性
ajaxMethod.forEach((method) => {
  api[method] = function (uri, data, config) {
    return new Promise(function (resolve, reject) {
      instance[method](uri, data, config)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
});

// 此处api拥有get方法和post方法，也配置好了请求路径
export default api;
