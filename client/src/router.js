import Vue from 'vue'
import Router from 'vue-router'

import {
  requireAdminAuth,
  requireCandidatAuth,
  checkAdminToken,
  checkCandidatToken,
  checkAccess,
} from './router-checks'
import { ROUTE_AUTHORIZE_AURIGE } from './constants'

Vue.use(Router)

const { VUE_APP_CLIENT_BUILD_TARGET } = process.env

const isBuildWithAll = ['ALL', undefined].includes(VUE_APP_CLIENT_BUILD_TARGET)
const isBuildWithCandidat = isBuildWithAll || ['CANDIDAT'].includes(VUE_APP_CLIENT_BUILD_TARGET)
const isBuildWithAdmin = isBuildWithAll || ['ADMIN'].includes(VUE_APP_CLIENT_BUILD_TARGET)

const Error404 = () => import('@/views/Error404.vue')
const Home = () => import('@/views/Home.vue')
const Guest = () => import('@/views/Guest.vue')
const MessageView = () => import('@/views/Message.vue')

const CandidatHome = () => import('@/views/CandidatHome.vue')
const SignupForm = () => import('./views/candidat/components/SignupForm.vue')
const EmailValidation = () => import('@/views/candidat/components/EmailValidation.vue')
const MentionsLegales = () => import('@/views/candidat/components/mentions-legales/MentionsLegales.vue')
const Faq = () => import('@/views/candidat/components/faq/Faq.vue')
const CenterSelection = () => import('@/views/candidat/components/center-selection/CenterSelection.vue')
const TimeSlot = () => import('@/views/candidat/components/time-slots-selection/TimeSlot.vue')
const SelectionSummary = () => import('@/views/candidat/components/selection-summary/SelectionSummary.vue')
const MyProfile = () => import('@/views/candidat/components/MyProfile.vue')
const LandingPage = () => import('@/views/candidat/components/LandingPage.vue')

const AdminLogin = () => import('@/views/admin/components/Login')
const AdminAurige = () => import('@/views/admin/components/Aurige.vue')
const HomeAdminPage = () => import('@/views/admin/components/HomeAdminPage.vue')
const ScheduleManager = () => import('@/views/admin/components/ScheduleManager.vue')
const Whitelist = () => import('@/views/admin/components/Whitelist.vue')

const adminRoutes = [
  {
    path: '/admin-login',
    name: 'admin-login',
    component: AdminLogin,
    beforeEnter: checkAdminToken,
  },
  {
    path: '/admin',
    component: () => import('./views/admin'),
    beforeEnter: requireAdminAuth,
    children: [
      {
        path: '',
        name: 'admin-home',
        component: HomeAdminPage,
      },
      {
        path: 'gestion-planning/:center?/:date?',
        name: 'gestion-planning',
        component: ScheduleManager,
      },
      {
        path: 'aurige',
        name: ROUTE_AUTHORIZE_AURIGE,
        component: AdminAurige,
        beforeEnter: checkAccess,
      },
      {
        path: 'whitelist',
        name: 'whitelist',
        component: Whitelist,
      },
    ],
  },
]

const candidatRoutes = [
  {
    path: '/candidat-guest',
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
        name: 'landing-page',
        component: LandingPage,
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
    redirect: '/qu-est-ce-que-candilib',
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
        path: ':departement/:center/:month/:day/:modifying/selection-place',
        name: 'time-slot',
        component: TimeSlot,
      },
      {
        path: ':departement/:center/:month/:day/:modifying/selection-place',
        name: 'time-slot-day',
        component: TimeSlot,
      },
      {
        path: ':departement/:center/:month/:day/:slot/:modifying/selection-confirmation',
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

const redirectCandidatFromHome = isBuildWithAdmin ? undefined : '/qu-est-ce-que-candilib'

const commonRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeComponent,
    redirect: redirectCandidatFromHome,
  },
  {
    path: '/guest',
    component: Guest,
    children: [
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
    ],
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
