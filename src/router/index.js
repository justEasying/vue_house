import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({
    left: 0,
    top: 0
  }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: '首页',
        activeMenu: '/'
      }
    },
    {
      path: '/want',
      name: 'want',
      component: () => import('../views/WantView.vue'),
      meta: {
        title: '想看',
        activeMenu: '/want'
      }
    },
    {
      path: '/service',
      name: 'service',
      component: () => import('../views/ServiceView.vue'),
      meta: {
        title: '服务',
        activeMenu: '/service'
      }
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('../views/DiscoverView.vue'),
      meta: {
        title: '发现',
        activeMenu: '/discover'
      }
    },
    {
      path: '/my',
      name: 'my',
      component: () => import('../views/MyView.vue'),
      meta: {
        title: '我的',
        activeMenu: '/my'
      }
    },
    {
      path: '/property/:id',
      name: 'property-detail',
      component: () => import('../views/PropertyDetailView.vue'),
      meta: {
        title: '房源详情',
        activeMenu: '/want'
      }
    },
    {
      path: '/service-detail/:id',
      name: 'service-detail',
      component: () => import('../views/ServiceDetailView.vue'),
      meta: {
        title: '服务详情',
        activeMenu: '/service'
      }
    },
    {
      path: '/activity/:id',
      name: 'activity-detail',
      component: () => import('../views/ActivityDetailView.vue'),
      meta: {
        title: '活动详情',
        activeMenu: '/discover'
      }
    },
    {
      path: '/benefit/:id',
      name: 'benefit-detail',
      component: () => import('../views/BenefitDetailView.vue'),
      meta: {
        title: '福利详情',
        activeMenu: '/discover'
      }
    },
    {
      path: '/my/want',
      name: 'my-want',
      component: () => import('../views/MyWantView.vue'),
      meta: {
        title: '我的想看',
        activeMenu: '/my'
      }
    },
    {
      path: '/my/footprint',
      name: 'my-footprint',
      component: () => import('../views/MyFootprintView.vue'),
      meta: {
        title: '我的足迹',
        activeMenu: '/my'
      }
    },
    {
      path: '/my/appointment',
      name: 'my-appointment',
      component: () => import('../views/MyAppointmentView.vue'),
      meta: {
        title: '我的约看',
        activeMenu: '/my'
      }
    },
    {
      path: '/my/share',
      name: 'my-share',
      component: () => import('../views/MyShareView.vue'),
      meta: {
        title: '我的拼租',
        activeMenu: '/my'
      }
    },
    {
      path: '/my/profile',
      name: 'user-profile',
      component: () => import('../views/UserProfileView.vue'),
      meta: {
        title: '个人资料',
        activeMenu: '/my'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        title: '登录',
        layout: 'blank'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Vue优设`
  } else {
    document.title = 'Vue优设'
  }
})

export default router
