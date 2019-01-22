import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import AdminHome from '@/views/AdminHome.vue'
import CandidatHome from '@/views/CandidatHome.vue'
import Error404 from '@/views/Error404.vue'

Vue.use(Router)

const adminRoutes = [
  {
    path: '/admin-login',
    name: 'admin-login',
    component: AdminHome,
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
]

const candidatRoutes = [
  {
    path: '/login',
    name: 'candidat-login',
    component: CandidatHome,
    meta: {
      guest: true,
    },
  },
  {
    path: '/candidat',
    name: 'candidat',
    component: () => import('./views/candidat'),
    meta: {
      requiresAuth: true,
    },
  },
]

const commonRoutes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      guest: true,
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

const routes = [
  ...adminRoutes,
  ...candidatRoutes,
  ...commonRoutes,
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
