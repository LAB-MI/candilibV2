/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import Vuex from 'vuex'
import Router from 'vue-router'

import AdminLogin from '../views/admin/components/Login.vue'
import AdminCalendar from '../views/admin/components/AdminCalendar.vue'
import AdminHeader from '../views/admin/components/AdminHeader.vue'
import AdminFooter from '../views/admin/components/AdminFooter.vue'
import AdminAurige from '../views/admin/components/Aurige.vue'
import AdminCandidatsList from '../views/admin/components/CandidatsList.vue'
import AdminWhitelist from '../views/admin/components/Whitelist.vue'
import AurigeValidation from '../views/admin/components/AurigeValidation.vue'
import AgGridAurigeStatusFilter from '../views/admin/components/AgGridAurigeStatusFilter.vue'

import Vuex from 'vuex'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AdminHeader,
  },
]

const router = new Router({
  mode: 'history',
  base: '/candilib',
  routes,
})

storiesOf('Admin Components', module)
  .add('AdminLogin', () => ({
    components: { AdminLogin },
    template: '<admin-login />',
  }))
  .add('AdminCalendar', () => ({
    components: { AdminCalendar },
    store,
    template: '<admin-calendar />',
  }))
  .add('AdminHeader', () => ({
    components: { AdminHeader },
    template: '<admin-header />',
    router,
  }))
  .add('AdminFooter', () => ({
    components: { AdminFooter },
    template: '<admin-footer />',
  }))
  .add('AdminAurige', () => ({
    components: { AdminAurige },
    template: '<admin-aurige />',
    store: new Vuex.Store({
      state: {
        aurige: {
          candidats: [{
            neph: '0000000000',
            nom: 'Dupont',
            status: 'success',
          }],
        },
      },
    }),
  }))
  .add('AdminCandidatsList', () => ({
    components: { AdminCandidatsList },
    template: '<admin-candidats-list />',
    store: new Vuex.Store({
      state: {
        candidats: {
          list: [{
            place: {
              inspecteur: 'Columbo',
              centre: 'Bobigny',
              date: new Date().toISOString(),
            },
            codeNeph: '0000000000',
            nomNaissance: 'Dupont',
            prenom: 'Jean',
            email: 'fifi@loulou.com',
          }],
        },
      },
      actions: {
        FETCH_CANDIDATS_REQUEST: () => {},
      },
    }),
  }))
  .add('AdminWhitelist', () => ({
    components: { AdminWhitelist },
    store: new Vuex.Store({
      state: {
        whitelist: {
          list: [
            {
              _id: 1,
              email: 'jean@dupont.fr',
            },
          ],
        },
      },
      actions: {
        FETCH_WHITELIST_REQUEST: () => {},
      },
    }),
    template: '<admin-whitelist />',
  }))
  .add('AurigeValidation', () => ({
    components: { AurigeValidation },
    store: new Vuex.Store({
      state: {
        aurige: {
          candidats: [{ status: 'error', neph: '01234567890', nom: 'test' }, { status: 'success', neph: '01234567891', nom: 'test1' }],
        },
      },
    }),
    template: '<aurige-validation style="background-color: #3d4353;"/>',
  })
  )
  .add('AgGridAurigeStatusFilter', () => ({
    components: { AgGridAurigeStatusFilter },
    template: '<ag-grid-aurige-status-filter />',
    methods: { action: action('clicked') },
  }))
