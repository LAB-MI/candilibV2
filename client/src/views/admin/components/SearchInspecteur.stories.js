
import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import SearchInspecteur from './SearchInspecteur'

const inspecteursList = [
  {
    _id: 1,
    matricule: '012345678910',
    nom: 'Elena',
    prenom: 'Elena',
    portable: '0601020304',
    email: 'elena@email.fr',
    departement: '93',
  },
  {
    _id: 2,
    matricule: '012345678912',
    nom: 'Marc',
    prenom: 'Marc',
    portable: '0601020304',
    email: 'marc@email.fr',
    departement: '93',
  },
  {
    _id: 3,
    matricule: '012345678916',
    nom: 'Antoine',
    prenom: 'Antoine',
    portable: '0601020304',
    email: 'Antoine@email.fr',
    departement: '93',
  },
]
storiesOf('Admin/SearchInspecteur', module)
  .add('Basic', () => ({
    components: { SearchInspecteur },
    template: `<search-inspecteur
      @selection="goToInspecteur"
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
