import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import SearchInspecteurs from './SearchInspecteurs'
const inspecteursList = [
  {
    _id: 1,
    matricule: '012345678910',
    nomNaissance: 'Marie',
  },
  {
    _id: 1,
    matricule: '012345678911',
    nomNaissance: 'Sophie',
  },
  {
    _id: 1,
    matricule: '012345678912',
    nomNaissance: 'Paula',
  },
]
storiesOf('Common/SearchInspecteurs', module)
  .add('Basic', () => ({
    components: { SearchInspecteurs },
    template: `<search-inspecteurs
      @selection="goToInspecteur"
      label="Recherche Inspecteurs"
      hint="nomNaissance"
    />`,
    methods: {
      goToInspecteur (inspecteur) {
        console.log('inspecteur selectionné', inspecteur)
      },
    },

    store: new Vuex.Store({
      state: {
        adminSearch: {
          inspecteurs: {
            isFetching: false,
            list: [],
          },
        },
      },
      mutations: {
        FETCH_SEARCH_INSPECTEURS_SUCCESS (state, list) {
          state.adminSearch.inspecteurs.list = list
        },
      },
      actions: {
        async FETCH_SEARCH_INSPECTEURS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = inspecteursList.filter(inspecteur => inspecteur.nomNaissance.includes(search))
          commit('FETCH_SEARCH_INSPECTEURS_SUCCESS', list)
        },
      },
    }),
  }))
