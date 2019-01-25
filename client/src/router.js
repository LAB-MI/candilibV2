import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import AdminHome from '@/views/AdminHome.vue'
import CandidatHome from '@/views/CandidatHome.vue'
import Error404 from '@/views/Error404.vue'

import store, {
  CHECK_ADMIN_TOKEN,
  CHECK_CANDIDAT_TOKEN,
  SIGNED_IN_AS_ADMIN,
  SIGNED_IN_AS_CANDIDAT,
  STORAGE_TOKEN_KEY,
} from '@/store'

Vue.use(Router)

const { CLIENT_BUILD_TARGET, NODE_ENV } = process.env

const isBuildWithAll = NODE_ENV !== 'production' || ['ALL', undefined].includes(CLIENT_BUILD_TARGET)
const isBuildWithCandidat = NODE_ENV !== 'production' || ['ALL', 'CANDIDAT'].includes(CLIENT_BUILD_TARGET)
const isBuildWithAdmin = NODE_ENV !== 'production' || ['ALL', 'ADMIN'].includes(CLIENT_BUILD_TARGET)

async function requireCandidatAuth(to, from, next) {
  const token = from.query.token || localStorage.getItem('token')
  const signupRoute = {
    name: 'candidat-signup',
    query: { nextPath: to.fullPath }
  }
  if (!token) {
    next(signupRoute)
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, token)
  if (store.state.auth.status !== SIGNED_IN_AS_CANDIDAT) {
    next(signupRoute)
    return
  }
  next()
}

async function requireAdminAuth(to, from, next) {
  const token = from.query.token || localStorage.getItem('token')
  const signinRoute = {
    name: 'admin-login',
    query: { nextPath: to.fullPath }
  }
  if (!token) {
    next(signinRoute)
  }
  await store.dispatch(CHECK_ADMIN_TOKEN, token)
  if (store.state.auth.status !== SIGNED_IN_AS_ADMIN) {
    next(signinRoute)
    return
  }
  next()
}

const adminRoutes = [
  {
    path: '/admin-login',
    name: 'admin-login',
    component: AdminHome,
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/admin'),
    beforeEnter: requireAdminAuth,
    children: [
      {
        path: ':tool',
        name: 'adminTool',
      },
    ],
  },
]

const candidatRoutes = [
  {
    path: '/candidat-signup',
    name: 'candidat-signup',
    component: CandidatHome,
  },
  {
    path: '/candidat',
    name: 'candidat',
    component: () => import('./views/candidat'),
    beforeEnter: requireCandidatAuth,
  },
]

const HomeComponent = isBuildWithAll ? Home : (isBuildWithAdmin ? AdminHome : CandidatHome)

const commonRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeComponent,
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
  ...(isBuildWithCandidat ? candidatRoutes : []),
  ...(isBuildWithAdmin ? adminRoutes : []),
  ...commonRoutes,
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
