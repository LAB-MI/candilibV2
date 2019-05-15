import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import ScheduleInspector from './ScheduleInspector.vue'

storiesOf('Admin', module)
  .add('ScheduleInspector', () => ({
    template: '<schedule-inspector />',
    components: { ScheduleInspector },
    store: new Vuex.Store({
      state: {
        admin: {
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
      actions: {},
    }),
  }))
