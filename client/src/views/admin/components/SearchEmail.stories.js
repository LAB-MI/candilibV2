import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import SearchEmail from './SearchEmail'

const emailsList = [
  {
    _id: 1,
    email: 'elena@email.fr',
    departement: '93',
  },
  {
    _id: 2,
    matricule: '012345678912',
    email: 'marc@email.fr',
    departement: '93',
  },
  {
    _id: 3,
    email: 'Antoine@email.fr',
    departement: '93',
  },
]
storiesOf('Admin/SearchEmail', module)
  .add('Basic', () => ({
    components: { SearchEmail },
    template: `<search-email
      @selection="goToEmail"
    />`,
    methods: {
      goToEmail (email) {
        console.log('email selectionné', email)
      },
    },

    store: new Vuex.Store({
      state: {
        whitelist: {
          matchingList: [],
        },
      },
      mutations: {
        FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS (state, list) {
          state.whitelist.matchingList = list
        },
      },
      actions: {
        async FETCH_AUTOCOMPLETE_WHITELIST_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = emailsList.filter(email => email.includes(search))
          commit('FETCH_AUTOCOMPLETE_WHITELIST_SUCCESS', list)
        },
      },
    }),
  }))
