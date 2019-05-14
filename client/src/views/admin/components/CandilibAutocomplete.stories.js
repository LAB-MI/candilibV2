import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import CandilibAutocomplete from './CandilibAutocomplete'
const inspecteursList = [
  {
    _id: 1,
    matricule: '012345678910',
    nom: 'Marie',
  },
  {
    _id: 1,
    matricule: '012345678911',
    nom: 'Sophie',
  },
  {
    _id: 1,
    matricule: '012345678912',
    nom: 'Paula',
  },
]

storiesOf('Admin/CandilibAutocomplete', module)
  .add('Basic', () => ({
    components: { CandilibAutocomplete },
    template: `<candilib-autocomplete
      @selection="goToSearch"
      label="Autocomplete"
      hint="tapez au moins 2 caracteres"
      item-text="nom"
      item-value="_id"
      :items="$store.state.adminSearch.inspecteurs.list"
      fetch-autocomplete-action="FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST"
    />`,

    methods: {
      goToSearch (inspecteur) {
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
        FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS (state, list) {
          state.adminSearch.inspecteurs.list = list
        },
      },
      actions: {
        async FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST ({ commit }, search) {
          await delay(500)
          const list = inspecteursList.filter(inspecteur => inspecteur.nom.includes(search))
          commit('FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS', list)
        },
      },
    }),
  }))
