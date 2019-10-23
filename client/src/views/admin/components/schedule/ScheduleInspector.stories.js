import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import router from '@/router'

import ScheduleInspector from './ScheduleInspector.vue'

storiesOf('Admin/ScheduleInspector', module)
  .add('ScheduleInspector', () => ({
    template: '<schedule-inspector />',
    components: { ScheduleInspector },
    store: new Vuex.Store({
      state: {
        adminBordereaux: {},
        admin: {
          inspecteurs: [],
          departements: [
            '93',
          ],
          places: {
            list: [
              {
                centre: {
                  _id: 1234567891,
                  nom: 'centre1',
                },
              },
              {
                centre: {
                  _id: 1234567892,
                  nom: 'centre2',
                },
              },
              {
                centre: {
                  _id: 1234567893,
                  nom: 'centre3',
                },
              },
              {
                centre: {
                  _id: 1234567894,
                  nom: 'centre4',
                },
              },
            ],
          },
        },
      },
      getters: {
        emailDepartementActive () {
          return 'candilib93@example.com'
        },
        activeDepartement () {
          return '93'
        },
      },
      actions: {
        FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST () {},
        SELECT_CENTER () {},
        FETCH_INSPECTEURS_BY_CENTRE_REQUEST () {},
      },
    }),
    router,
  }))
