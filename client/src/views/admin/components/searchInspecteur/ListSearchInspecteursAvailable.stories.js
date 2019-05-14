import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'
import delay from 'delay'

import ListSearchInspecteursAvailable from './ListSearchInspecteursAvailable.vue'

const inspecteursList = {
  'centre1': {
    'date1':
      [
        {
          _id: 1,
          matricule: '012345678910',
          nom: 'Marie',
        },
        {
          _id: 2,
          matricule: '012345678911',
          nom: 'Sophie',
        },
        {
          _id: 3,
          matricule: '012345678912',
          nom: 'Paula',
        },
      ],
  },
}

storiesOf('Admin/searchInspecteur', module)
  .add('ListSearchInspecteursAvailable', () => ({
    template: '<div><list-search-inspecteurs-available date="date1" centre="centre1" @select-inspecteur="selectedInspecteur" /></div>',
    components: { ListSearchInspecteursAvailable },
    store: new Vuex.Store({
      state: {
        adminModifIpcsr: {
          inspecteurs: {
            isFetching: false,
            list: [],
          },
        },
      },
      mutations: {
        FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST (state) {
          state.adminModifIpcsr.inspecteurs.isFetching = true
        },
        FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS (state, list) {
          state.adminModifIpcsr.inspecteurs.list = list
          state.adminModifIpcsr.inspecteurs.isFetching = false
        },
      },
      actions: {
        async FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST ({ commit }, { centre, date }) {
          commit('FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST')
          console.log({ centre, date })
          await delay(1000)
          const list = inspecteursList[centre][date]
          commit('FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS', list)
        },
      },
    }),
    methods: {
      selectedInspecteur (inspecteur) {
        alert(inspecteur.nom)
      },
    },
  }))
