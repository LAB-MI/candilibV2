/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import delay from 'delay'

import Vuex from 'vuex'

import router from '../router'

import AdminLogin from '../views/admin/components/Login.vue'
import AdminCalendar from '../views/admin/components/AdminCalendar.vue'
import AdminHeader from '../views/admin/components/AdminHeader.vue'
import AdminFooter from '../views/admin/components/AdminFooter.vue'
import AdminAurige from '../views/admin/components/Aurige.vue'
import AdminCandidatsList from '../views/admin/components/CandidatsList.vue'
import AdminWhitelist from '../views/admin/components/Whitelist.vue'
import AurigeValidation from '../views/admin/components/AurigeValidation.vue'
import AgGridAurigeStatusFilter from '../views/admin/components/AgGridAurigeStatusFilter.vue'

import store from '../store'

const getRandomString = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)

storiesOf('Admin', module)
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
    template: '<admin-header email="admin@example.com" />',
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
          isFetching: false,
          list: [
            {
              _id: getRandomString(),
              email: 'jean@dupont.fr',
            },
          ],
        },
      },
      mutations: {
        DELETE_EMAIL_REQUEST (state, idToRemove) {
          state.whitelist.list = state.whitelist.list.filter(({ _id }) => _id !== idToRemove)
        },

        FETCH_WHITELIST_REQUEST (state) {
          state.whitelist.isFetching = true
        },

        FETCH_WHITELIST_SUCCESS (state, list) {
          state.whitelist.isFetching = false
        },

        SAVE_EMAIL_REQUEST (state, email) {
          state.whitelist.list = [
            ...state.whitelist.list,
            {
              _id: getRandomString(),
              email,
            },
          ]
        },

        SAVE_EMAIL_BATCH_REQUEST (state, emails) {
          state.whitelist.list = [
            ...state.whitelist.list,
            ...emails.map(email => ({
              _id: getRandomString(),
              email,
            })),
          ]
        },
      },
      actions: {
        async FETCH_WHITELIST_REQUEST ({ commit }) {
          commit('FETCH_WHITELIST_REQUEST')
          await delay(1000)
          commit('FETCH_WHITELIST_SUCCESS')
        },
        async DELETE_EMAIL_REQUEST ({ commit }, id) {
          commit('FETCH_WHITELIST_REQUEST')
          await delay(500)
          commit('DELETE_EMAIL_REQUEST', id)
          commit('FETCH_WHITELIST_SUCCESS')
        },
        async SAVE_EMAIL_REQUEST ({ commit }, email) {
          commit('FETCH_WHITELIST_REQUEST')
          await delay(1000)
          commit('SAVE_EMAIL_REQUEST', email)
          commit('FETCH_WHITELIST_SUCCESS')
        },
        async SAVE_EMAIL_BATCH_REQUEST ({ commit }, emails) {
          commit('FETCH_WHITELIST_REQUEST')
          await delay(1000)
          commit('SAVE_EMAIL_BATCH_REQUEST', emails)
          commit('FETCH_WHITELIST_SUCCESS')
        },
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
