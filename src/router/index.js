import Vue from 'vue';
import Router from 'vue-router';

// 博客路由
import blogRoutes from './blog';

Vue.use(Router);
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default new Router({
  routes: [
    {
      path: '/Login',
      meta: { title: '用户登录' },
      name: 'Login',
      component: resolve => require(['@/pages/login/index.vue'], resolve)
    },
    {
      path: '/',
      meta: { title: '首页' },
      component: resolve => require(['@/pages/menu/index'], resolve),
      redirect: '/home',
      children: [
        {
          path: '/home',
          meta: { title: '概览' },
          component: resolve => require(['@/pages/home/index'], resolve)
        },
        ...blogRoutes
      ]
    }
  ]
});
