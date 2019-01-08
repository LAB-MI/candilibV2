import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Home,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('./views/Admin.vue'),
    },
  ],
})
