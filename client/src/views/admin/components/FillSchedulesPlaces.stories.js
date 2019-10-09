import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import FillSchedulesPlaces from './FillSchedulesPlaces.vue'

storiesOf('Admin', module)
  .add('FillSchedulesPlaces', () => ({
    template: '<fill-schedules-places />',
    components: { FillSchedulesPlaces },
    store: new Vuex.Store({
      state: {},
      actions: {},
    }),
  }))
