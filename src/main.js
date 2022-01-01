import app from '@utils/app';
import router from './router/index';
import store from './store/index';
import * as getApi from '@apis/http';
import util from '@utils/util';
import common from '@assets/js/common';
import '@plugins/elements.js';

import '@assets/css/global.css';
import '@assets/less/reset.less';
// 添加几个可以在应用的任何组件实例中访问的全局 property
// $http代表封装好的请求路径，$utils是一些格式化的方法，$COMMON是一些通用的数据类型的相关信息
app.config.globalProperties['$http'] = getApi;
app.config.globalProperties['$utils'] = util;
app.config.globalProperties['$COMMON'] = common;

app.use(router).use(store).mount('#app');
// "element-plus": "^1.0.2-beta.36",
