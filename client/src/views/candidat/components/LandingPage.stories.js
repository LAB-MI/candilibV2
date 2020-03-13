import { storiesOf } from '@storybook/vue'

import Vuex from 'vuex'

import LandingPage from './LandingPage.vue'
import router from '@/router'

storiesOf('Candidat', module)
  .add('LandingPage', () => ({
    components: { LandingPage },
    template: '<landing-page />',
    store: new Vuex.Store({
      state: {
        candidat: {},
      },
    }),
    router,
  }))
