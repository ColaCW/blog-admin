import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import router from './router/router.js';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import showdown from 'showdown';

Vue.prototype.axios = axios;
axios.defaults.withCredentials = true;
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
