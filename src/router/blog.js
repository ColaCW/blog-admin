const RouteView = () => import('@/layout/RouteView');

// 博客路由
const menuRoutes = [
  {
    path: '/blogManagement',
    meta: { title: '博客管理' },
    redirect: '/blogManagement/blog',
    component: RouteView,
    children: [
      {
        path: '/blogManagement/blog',
        meta: { title: '博客' },
        component: resolve => require(['@/pages/blogManagement/blog/index'], resolve)
      },
      {
        path: '/blogManagement/blogCategory',
        meta: { title: '博客分类' },
        component: resolve => require(['@/pages/blogManagement/blogCategory/index'], resolve)
      },
      {
        path: '/blogManagement/friendHref',
        meta: { title: '友情链接' },
        component: resolve => require(['@/pages/blogManagement/friendHref/index'], resolve)
      }
    ]
  }
];

export default menuRoutes;
