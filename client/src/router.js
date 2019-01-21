import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Error404 from '@/views/Error404.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Home,
    meta: {
      guest: true,
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/admin'),
    children: [
      {
        path: ':tool',
        name: 'adminTool',
      },
    ],
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/*',
    name: '404',
    component: Error404,
    meta: {
      requiresAuth: true,
    },
  },
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
