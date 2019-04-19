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
          placesByCentre: {
            list: [
              {
                centre: {
                  nom: 'centre1',
                },
              },
              {
                centre: {
                  nom: 'centre2',
                },
              },
              {
                centre: {
                  nom: 'centre3',
                },
              },
              {
                centre: {
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
