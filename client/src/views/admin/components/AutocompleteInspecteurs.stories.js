import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import AutocompleteInspecteurs from './AutocompleteInspecteurs'
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
storiesOf('Admin/AutocompleteInspecteurs', module)
  .add('Basic', () => ({
    components: { AutocompleteInspecteurs },
    template: `<autocomplete-inspecteurs
      @selection="goToInspecteur"
      label="Recherche Inspecteurs"

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
        FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS (state, list) {
          state.adminSearch.inspecteurs.list = list
        },
      },
      actions: {
        async FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = inspecteursList.filter(inspecteur => inspecteur.nom.includes(search))
          commit('FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS', list)
        },
      },
    }),
  }))
