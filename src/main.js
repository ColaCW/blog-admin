import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import router from './router/index.js';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import showdown from 'showdown';
import moment from 'moment';
import '@/config/use'; // 全局加载组件

/* 日期格式化 */
Vue.use(require('vue-moment'));
Vue.prototype.moment = moment;
Vue.filter('dateYMDHMSFormat', function (dateStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dateStr).format(pattern);
});

Vue.prototype.axios = axios;
axios.defaults.withCredentials = true;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

Vue.config.productionTip = false;
Vue.use(ElementUI, showdown);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App></App>'
});

const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};
