import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import GenerateInspecteurBordereaux from './GenerateInspecteurBordereaux.vue'

storiesOf('Admin', module)
  .add('GenerateInspecteurBordereaux', () => ({
    template: '<generate-inspecteur-bordereaux />',
    components: { GenerateInspecteurBordereaux },
    store: new Vuex.Store({
      state: {
        admin: {
          departements: {
            active: '75',
          },
          email: 'user@example.com',
        },
        adminBordereaux: {
          isGenerating: true,
        },
      },
      getters: {
        emailDepartementActive: state => {
          return state.admin.email
        },
      },
    }),
  }))
