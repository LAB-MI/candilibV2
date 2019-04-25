
import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import AutocompleteCandidats from './AutocompleteCandidats'
const candidatsList = [
  {
    _id: 1,
    codeNeph: '012345678910',
    nomNaissance: 'Caroline',
  },
  {
    _id: 2,
    codeNeph: '012345678911',
    nomNaissance: 'Stan',
  },
  {
    _id: 3,
    codeNeph: '012345678912',
    nomNaissance: 'Jérémy',
  },
  {
    _id: 4,
    codeNeph: '012345678913',
    nomNaissance: 'Philippe',
  },
  {
    _id: 5,
    codeNeph: '012345678914',
    nomNaissance: 'Manon',
  },
]

storiesOf('Admin/Autocomplete', module)
  .add('Basic', () => ({
    components: { AutocompleteCandidats },
    template: `<autocomplete-candidats
      @selection="goToCandidat"
      label="Recherche Candidats"
    />`,
    methods: {
      goToCandidat (candidat) {
        console.log('candidat selectionné', candidat)
      },
    },
    store: new Vuex.Store({
      state: {
        adminSearch: {
          candidats: {
            isFetching: false,
            list: [],
          },
        },
      },

      mutations: {
        FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS (state, list) {
          state.adminSearch.candidats.list = list
        },
      },

      actions: {
        async FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = candidatsList.filter(candidat => candidat.nomNaissance.includes(search))
          commit('FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS', list)
        },
      },
    }),
  }))
