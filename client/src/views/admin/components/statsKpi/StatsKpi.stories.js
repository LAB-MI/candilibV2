import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import StatsKpi from './StatsKpi.vue'

storiesOf('Admin', module)
  .add('StatsKpi', () => ({
    template: '<stats-kpi />',
    components: { StatsKpi },
    store: new Vuex.Store({
      getters: {
        activeDepartement: state => {
          return state.admin.departements.active
        },
      },
      state: {
        admin: {
          departements: {
            list: ['75', '93'],
            active: '75',
          },
          email: 'user@example.com',
        },
      },
      actions: {},
    }),
  }))
