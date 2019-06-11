import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import DepartementSelector from './DepartementSelector.vue'

const infos = {
  departements: {
    list: ['75', '93'],
  },
  email: 'admin@example.com',
}

infos.departements.active = infos.departements.list[0]

storiesOf('Admin', module)
  .add('DepartementSelector', () => ({
    template: '<v-toolbar dark><departement-selector /></v-toolbar>',
    components: { DepartementSelector },
    store: new Vuex.Store({
      state: {
        admin: {
          departements: {
            list: ['75', '93'],
            active: '75',
          },
          email: 'user@example.com',
        },
      },

      mutations: {
        SELECT_DEPARTEMENT (state, active) {
          state.admin.departements.active = active
        },
      },

      actions: {
        FETCH_ADMIN_INFO_REQUEST () {
        },

        SELECT_DEPARTEMENT ({ commit }, departement) {
          commit('SELECT_DEPARTEMENT', departement)
        },
      },
    }),
  }))
