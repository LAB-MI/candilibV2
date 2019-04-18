
import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import SearchCandidats from './SearchCandidats'
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

storiesOf('Common/Autocomplete', module)
  .add('Basic', () => ({
    components: { SearchCandidats },
    template: `<search-candidats
      @selection="goToCandidat"
      label="Recherche Candidats"
      hint="NomNaissance ou NEPH d'un candidat"
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
        FETCH_SEARCH_CANDIDATS_SUCCESS (state, list) {
          state.adminSearch.candidats.list = list
        },
      },

      actions: {
        async FETCH_SEARCH_CANDIDATS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = candidatsList.filter(candidat => candidat.nomNaissance.includes(search))
          commit('FETCH_SEARCH_CANDIDATS_SUCCESS', list)
        },
      },
    }),
  }))
