import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import delay from 'delay'

import AutocompleteProfile from './AutocompleteProfile'

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

storiesOf('Admin/AutocompleteProfile', module)
  .add('Basic', () => ({
    components: { AutocompleteProfile },
    template: `<autocomplete-profile
      @selection="goToSearch"
      label="Recherche"

    />`,

    methods: {
      goToSearch (inspecteur, candidat) {
        console.log(inspecteur, candidat)
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
        state: {
          adminSearch: {
            candidat: {
              isFetching: false,
              list: [],
            },
          },
        },
      },
      mutations: {
        FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS (state, list) {
          state.adminSearch.inspecteurs.list = list
        },
        FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS (state, list) {
          state.adminSearch.candidats.list = list
        },
      },
      actions: {
        async FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = inspecteursList.filter(inspecteur => inspecteur.nom.includes(search))
          commit('FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS', list)
        },
        async FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST ({ commit }, search) {
          await delay(1000)
          const list = candidatsList.filter(candidat => candidat.nomNaissance.includes(search))
          commit('FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS', list)
        },
      },
    }),
  }))
