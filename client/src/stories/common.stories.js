/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import AppVersion from '../components/AppVersion.vue'
import PureAppSnackbar from '../components/PureAppSnackbar.vue'

storiesOf('AppVersion', module)
  .add('with text', () => ({
    components: { AppVersion },
    template: `<app-version />`,
    methods: { action: action('clicked') },
  }))

storiesOf('PureAppSnackbar', module)
  .add('Error', () => ({
    components: { PureAppSnackbar },
    template: `<pure-app-snackbar @click="action" :message="message">Hello PureAppSnackbar</pure-app-snackbar>`,
    methods: { action: action('clicked') },
    data () {
      return {
        message: {
          content: 'Erreur de la snackbar',
          color: 'error',
          timeout: 0,
          show: true,
        },
      }
    },
  }))
  .add('Info', () => ({
    components: { PureAppSnackbar },
    template: `<pure-app-snackbar @click="action" :message="message">Hello PureAppSnackbar</pure-app-snackbar>`,
    methods: { action: action('clicked') },
    data () {
      return {
        message: {
          content: 'Info de la snackbar',
          color: 'info',
          timeout: 0,
          show: true,
        },
      }
    },
  }))
  .add('Success', () => ({
    components: { PureAppSnackbar },
    template: `<pure-app-snackbar @click="action" :message="message">Hello PureAppSnackbar</pure-app-snackbar>`,
    methods: { action: action('clicked') },
    data () {
      return {
        message: {
          content: 'Message de la snackbar',
          color: 'success',
          timeout: 0,
          show: true,
        },
      }
    },
  }))
