/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'

import Vuex from 'vuex'

import AppVersion from '../components/AppVersion.vue'
import PureAppSnackbar from '../components/PureAppSnackbar.vue'
import CandidatPresignup from '../views/candidat/components/SignupForm.vue'

storiesOf('CandidatPresignup', module)
  .add('Pré-inscription', () => ({
    components: { CandidatPresignup },
    template: `<div :style="{display: 'flex', background: '#118098'}"><candidat-presignup /></div>`,
    store: new Vuex.Store({
      state: {
        candidat: {
          isSendingPresignup: false,
        },
      },
    }),
  }))

storiesOf('AppVersion', module)
  .add('with text', () => ({
    components: { AppVersion },
    template: `<app-version />`,
  }))

storiesOf('PureAppSnackbar', module)
  .add('Error', () => ({
    components: { PureAppSnackbar },
    template: `<pure-app-snackbar @click="action" :message="message">Hello PureAppSnackbar</pure-app-snackbar>`,
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
