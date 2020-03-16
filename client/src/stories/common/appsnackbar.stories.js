import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import Vuex from 'vuex'

import AppSnackbar from '../../components/AppSnackbar.vue'

storiesOf('Common/AppSnackbar', module)
  .add('Error', () => ({
    components: { AppSnackbar },
    template: '<app-snackbar @click="action">Hello AppSnackbar</app-snackbar>',
    methods: { action: action('clicked') },
    store: new Vuex.Store({
      state: {
        message: {
          content: 'Erreur de la snackbar',
          color: 'error',
          timeout: 0,
          show: true,
        },
      },
    }),
  }))
  .add('Info', () => ({
    components: { AppSnackbar },
    template: '<app-snackbar @click="action">Hello AppSnackbar</app-snackbar>',
    store: new Vuex.Store({
      state: {
        message: {
          content: 'Info de la snackbar',
          color: 'info',
          timeout: 0,
          show: true,
        },
      },
    }),
    methods: { action: action('clicked') },
  }))
  .add('Success', () => ({
    components: { AppSnackbar },
    template: '<app-snackbar @click="action">Hello AppSnackbar</app-snackbar>',
    store: new Vuex.Store({
      state: {
        message: {
          content: 'Message de la snackbar',
          color: 'success',
          timeout: 0,
          show: true,
        },
      },
    }),
    methods: { action: action('clicked') },
  }))
