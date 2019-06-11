import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import FillShedulesPlaces from './FillShedulesPlaces.vue'

storiesOf('Admin', module)
  .add('FillShedulesPlaces', () => ({
    template: '<fill-shedules-places />',
    components: { FillShedulesPlaces },
    store: new Vuex.Store({
      state: {},
      actions: {},
    }),
  }))
