/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import Vuex from 'vuex'

import router from '../router'

import MyProfile from '../views/candidat/components/MyProfile.vue'
import ProfileInfo from '../views/candidat/components/ProfileInfo.vue'
import CandidatPresignup from '../views/candidat/components/SignupForm.vue'
import NavigationDrawer from '../views/candidat/components/NavigationDrawer.vue'
import EmailValidation from '../views/candidat/components/EmailValidation.vue'
import CandidatHeader from '../views/candidat/components/CandidatHeader.vue'
import CandidatFooter from '../views/candidat/components/CandidatFooter.vue'

const viewport = { defaultViewport: 'iphone6' }

storiesOf('Candidat', module)
  .addParameters({ viewport })
  .add('Pré-inscription', () => ({
    components: { CandidatPresignup },
    template: '<div :style="{display: \'flex\', background: \'#118098\'}"><candidat-presignup /></div>',
    router,
    store: new Vuex.Store({
      state: {
        candidat: {
          isSendingPresignup: false,
        },
      },
    }),
  }))
  .add('CandidatProfile', () => ({
    components: { MyProfile },
    template: '<my-profile />',
    store: new Vuex.Store({
      state: {
        candidat: {
          isFetchingProfile: false,
          me: {},
        },
      },
      mutations: {
        FETCH_MY_PROFILE_REQUEST (state) {
          state.candidat.me = {
            email: 'jean@dupont.com',
            adresse: '10 avenue du Général Leclerc',
            codeNeph: '012345678912',
            nomNaissance: 'Dupont',
            portable: '0645784512',
            prenom: 'Jean',
          }
        },
      },
      actions: {
        FETCH_MY_PROFILE_REQUEST ({ commit }) {
          commit('FETCH_MY_PROFILE_REQUEST')
        },
      },
    }),
  }))
  .add('CandidatProfileInfo', () => ({
    components: { ProfileInfo },
    template: '<profile-info label="courriel" value="jean@dupont.com" />',
  }))
  .add('NavigationDrawer', () => ({
    components: { NavigationDrawer },
    template: '<div><v-btn @click="$store.dispatch(\'DISPLAY_NAV_DRAWER\', true)">Afficher le menu</v-btn><navigation-drawer :links="links" /></div>',
    router,
    data () {
      return {
        links: [
          {
            routerTo: '/candidat',
            iconName: 'home',
            tooltipText: 'Ma réservation',
            label: 'Ma réservation',
          },
          {
            routerTo: '/faq',
            iconName: 'help_outline',
            tooltipText: 'FAQ',
            label: 'F.A.Q.',
          },
          {
            routerTo: '/mentions-legales',
            iconName: 'account_balance',
            tooltipText: 'Mentions légales',
            label: 'Mentions légales',
          },
        ],
      }
    },
    store: new Vuex.Store({
      state: {
        candidat: {
          displayNavDrawer: false,
        },
      },
      mutations: {
        DISPLAY_NAV_DRAWER (state, bool) {
          state.candidat.displayNavDrawer = bool
        },
      },
      actions: {
        DISPLAY_NAV_DRAWER ({ commit }, bool) {
          commit('DISPLAY_NAV_DRAWER', bool)
        },
      },
    }),
  }))
  .add('EmailValidation', () => ({
    components: { EmailValidation },
    template: '<email-validation />',
    router,
    store: new Vuex.Store({
      state: {
        candidat: {
          isCheckingEmail: false,
          candidatData: {
            message: '',
          },
        },
      },
    }),
  }))
  .add('CandidatHeader', () => ({
    components: { CandidatHeader },
    template: '<candidat-header />',
    router,
    data () {
      return {
        ids: {},
        links: [],
      }
    },
    store: new Vuex.Store({
      state: {
        candidat: {
          displayNavDrawer: false,
        },
      },
      getters: {
        isCandidatSignedIn () {},
      },
      mutations: {
        DISPLAY_NAV_DRAWER (state, bool) {
          state.candidat.displayNavDrawer = bool
        },
      },
      actions: {
        DISPLAY_NAV_DRAWER ({ commit }, bool) {
          commit('DISPLAY_NAV_DRAWER', bool)
          action('Clicked on Burger, display nav drawer')(bool)
        },
      },
    }),
  }))
  .add('CandidatFooter', () => ({
    components: { CandidatFooter },
    template: '<candidat-footer :ids="ids" :links="links" />',
    router,
    data () {
      return {
        ids: {},
        links: [],
      }
    },
  }))
