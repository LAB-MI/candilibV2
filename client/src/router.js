import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import AdminLogin from '@/views/admin/components/Login'
import CandidatHome from '@/views/CandidatHome.vue'
import MessageView from '@/views/Message.vue'
import EmailValidation from '@/views/candidat/components/EmailValidation.vue'
import Error404 from '@/views/Error404.vue'
import MentionsLegales from '@/views/candidat/components/mentions-legales/MentionsLegales.vue'
import Faq from '@/views/candidat/components/faq/Faq.vue'
import CenterSelection from '@/views/candidat/components/center-selection/CenterSelection.vue'
import TimeSlot from '@/views/candidat/components/time-slots-selection/TimeSlot.vue'
import SelectionSummary from '@/views/candidat/components/selection-summary/SelectionSummary.vue'
import MyProfile from '@/views/candidat/components/MyProfile.vue'
import LandingPage from '@/views/candidat/components/LandingPage.vue'
import CandidatSteps from '@/views/candidat/components/CandidatSteps.vue'

import AdminAurige from '@/views/admin/components/Aurige.vue'
import Whitelist from '@/views/admin/components/Whitelist.vue'
import AdminCalendar from '@/views/admin/components/AdminCalendar.vue'
import HomeAdminPage from '@/views/admin/components/HomeAdminPage.vue'

import {
  requireAdminAuth,
  requireCandidatAuth,
  checkAdminToken,
  checkCandidatToken,
} from './router-checks'
import { SignupForm } from './views/candidat/components'

Vue.use(Router)

const { VUE_APP_CLIENT_BUILD_TARGET } = process.env

const isBuildWithAll = ['ALL', undefined].includes(VUE_APP_CLIENT_BUILD_TARGET)
const isBuildWithCandidat = isBuildWithAll || ['CANDIDAT'].includes(VUE_APP_CLIENT_BUILD_TARGET)
const isBuildWithAdmin = isBuildWithAll || ['ADMIN'].includes(VUE_APP_CLIENT_BUILD_TARGET)

const adminRoutes = [
  {
    path: '/admin-login',
    name: 'admin-login',
    component: AdminLogin,
    beforeEnter: checkAdminToken,
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/admin'),
    beforeEnter: requireAdminAuth,
    children: [
      {
        path: '',
        name: 'admin-home',
        component: HomeAdminPage,
      },
      {
        path: 'aurige',
        name: 'aurige',
        component: AdminAurige,
      },
      {
        path: 'whitelist',
        name: 'whitelist',
        component: Whitelist,
      },
      {
        path: 'admin-calendar',
        name: 'admin-calendar',
        component: AdminCalendar,
      },
    ],
  },
]

const candidatRoutes = [
  {
    path: '/guest',
    component: MessageView,
    children: [
      {
        path: '/candidat-presignup',
        name: 'candidat-presignup',
        component: SignupForm,
        beforeEnter: checkCandidatToken,
      },
      {
        path: '/qu-est-ce-que-candilib',
        name: 'what-is-candilib',
        component: LandingPage,
        beforeEnter: checkCandidatToken,
      },
      {
        path: '/candidat-steps',
        name: 'candidat-steps',
        component: CandidatSteps,
        beforeEnter: checkCandidatToken,
      },
      {
        path: '/email-en-attente-de-validation',
        name: 'email-validation-pending',
        component: EmailValidation,
      },
      {
        path: '/email-validation',
        name: 'email-validation',
        component: EmailValidation,
      },
    ],
  },
  {
    path: '/candidat',
    name: 'candidat',
    component: () => import('./views/candidat'),
    beforeEnter: requireCandidatAuth,
    redirect: '/candidat/home',
    children: [
      {
        path: 'home',
        name: 'candidat-home',
        component: CandidatHome,
        meta: {
          isConfirmation: false,
        },
      },
      {
        path: ':modifying/selection-centre',
        name: 'selection-centre',
        component: CenterSelection,
      },
      {
        path: ':departement/:center/:modifying/selection-place',
        name: 'time-slot',
        component: TimeSlot,
      },
      {
        path: ':departement/:center/:day/:modifying/selection-place',
        name: 'time-slot-day',
        component: TimeSlot,
      },
      {
        path: ':departement/:center/:slot/:modifying/selection-confirmation',
        name: 'selection-summary',
        component: SelectionSummary,
        meta: {
          isConfirmation: true,
        },
      },
      {
        path: 'mon-profil',
        name: 'my-profile',
        component: MyProfile,
      },
      {
        path: 'mentions-legales',
        name: 'mentions-legales-candidat',
        component: MentionsLegales,
      },
      {
        path: 'faq',
        name: 'faq-candidat',
        component: Faq,
      },
    ],
  },
]

const HomeComponent = isBuildWithAll ? Home : (isBuildWithAdmin ? AdminLogin : CandidatHome)

const commonRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeComponent,
  },
  {
    path: '/mentions-legales',
    name: 'mentions-legales',
    component: MentionsLegales,
  },
  {
    path: '/faq',
    name: 'faq',
    component: Faq,
  },
  {
    path: '/*',
    name: '404',
    component: Error404,
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
