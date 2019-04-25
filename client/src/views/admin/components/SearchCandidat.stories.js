
import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import SearchCandidat from './SearchCandidat'

const candidatsList = [
  {
    _id: 1,
    adresse: 'rue des marguerites',
    codeNeph: '012345678910',
    email: 'caro@email.fr',
    nomNaissance: 'Caroline',
    prenom: 'Caroline',
    portable: ' 0102030405',
    presignedUpAt: '2019-04-15',
  },
  {
    _id: 2,
    adresse: 'rue des tulipes',
    codeNeph: '012345678910',
    email: 'Stan@email.fr',
    nomNaissance: 'Stan',
    prenom: 'Stan',
    portable: ' 0102030403',
    presignedUpAt: '2019-04-16',
  },
  {
    _id: 3,
    adresse: 'rue des roses',
    codeNeph: '012345678910',
    email: 'Jeremy@email.fr',
    nomNaissance: 'Jérémy',
    prenom: 'Jeremy',
    portable: ' 0102036405',
    presignedUpAt: '2019-04-15',
  },
  {
    _id: 4,
    adresse: '244 rue des bleuets 75014 Paris',
    codeNeph: '012345678910',
    email: 'Philippe@email.fr',
    nomNaissance: 'Philippe',
    prenom: 'Philippe',
    portable: ' 0102030425',
    presignedUpAt: '2019-04-15',
  },
  {
    _id: 5,
    adresse: 'rue des lys',
    codeNeph: '012345678910',
    email: 'manon@email.fr',
    nomNaissance: 'Manon',
    prenom: 'Manon',
    portable: ' 0102030415',
    presignedUpAt: '2019-04-15',
  },
]

storiesOf('Admin/SearchCandidat', module)
  .add('Basic', () => ({
    components: { SearchCandidat },
    template: `<search-candidat
      @selection="goToCandidat"
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
