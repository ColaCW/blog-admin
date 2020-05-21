import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/pages/Main';
import Blog from '@/pages/Blog';
import BlogCategory from '@/pages/BlogCategory';
import Login from '@/pages/Login';
import SystemMenu from '@/pages/SystemMenu';
import Upload from '@/pages/Upload';
import User from '@/pages/User';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/Login',
      meta: { title: '用户登录' },
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Main',
      meta: { title: '首页' },
      component: Main,
      children: [
        {
          path: '/Blog',
          name: 'Blog',
          meta: { title: '博客' },
          component: Blog
        },
        {
          path: '/BlogCategory',
          name: 'BlogCategory',
          meta: { title: '博客分类' },
          component: BlogCategory
        },
        {
          path: '/SystemMenu',
          name: 'SystemMenu',
          meta: { title: '系统菜单' },
          component: SystemMenu
        },
        {
          path: '/Upload',
          name: 'Upload',
          meta: { title: '上传文件' },
          component: Upload
        },
        {
          path: '/User',
          name: 'User',
          meta: { title: '用户' },
          component: User
        }
      ]
    }
  ]
});
