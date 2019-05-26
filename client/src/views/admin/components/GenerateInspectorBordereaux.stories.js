// import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import GenerateInspecteurBordereaux from './GenerateInspecteurBordereaux.vue'

storiesOf('Admin', module)
  .add('GenerateInspecteurBordereaux', () => ({
    template: '<generate-inspecteur-bordereaux />',
    components: { GenerateInspecteurBordereaux },
    // store: new Vuex.Store({
    //   state: {
    //     admin: {
    //       departements: {
    //         list: ['75', '93'],
    //         active: '75',
    //       },
    //       email: 'user@example.com',
    //     },
    //   },

    //   mutations: {
    //     SELECT_DEPARTEMENT (state, active) {
    //       state.admin.departements.active = active
    //     },
    //   },

    //   actions: {
    //     FETCH_ADMIN_INFO_REQUEST () {
    //     },

    //     SELECT_DEPARTEMENT ({ commit }, departement) {
    //       commit('SELECT_DEPARTEMENT', departement)
    //     },
    //   },
    // }),
  }))
