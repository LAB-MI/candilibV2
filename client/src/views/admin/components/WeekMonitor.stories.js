import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import WeekMonitor from './WeekMonitor.vue'

storiesOf('Admin', module)
  .add('WeekMonitor', () => ({
    template: '<week-monitor nameCenter="Nom du centre" :weeks="{}" />',
    components: { WeekMonitor },
    store: new Vuex.Store({
      state: {},
      actions: {},
    }),
  }))
