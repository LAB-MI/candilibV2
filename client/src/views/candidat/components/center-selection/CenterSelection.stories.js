import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import CenterSelection from './CenterSelection.vue'

storiesOf('Candidat', module)
  .add('CenterSelection', () => ({
    components: { CenterSelection },
    store: new Vuex.Store({
      state: {
        center: {
          list: [],
          selected: undefined,
          centre: {
            geoloc: {
              coordinates: [],
            },
          },
        },
        candidat: {
          me: undefined,
        },
      },
      mutations: {
        FETCH_MY_PROFILE_REQUEST (state) {
          state.candidat.me = {
            email: 'jean@dupont.com',
            adresse: '10 avenue du Général Leclerc',
            codeNeph: '012345678912',
            nomNaissance: 'Dupont',
            portable: '0645784512',
            prenom: 'Jean',
          }
        },
        FETCH_CENTERS_REQUEST (state) {
          state.center.list = [
            {
              centre: {
                _id: '5c87b264b62cc5004cc77894',
                adresse: '99 Avenue du Général de Gaulle, Rosny ss Bois, FR, 93110',
                departement: '93',
                label: 'Centre d\'examen du permis de conduire de Rosny-sous-Bois',
                nom: 'Rosny',
                geoloc: {
                  coordinates: [],
                },
              },
              count: 10,
            },
            {
              centre: {
                _id: '5c87b264b62cc5004cc77894',
                adresse: '4 Avenue Jean Fourgeaud 93420',
                departement: '93',
                label: 'Centre d\'examen du permis de conduire de Rosny-sous-Bois',
                nom: 'Villepinte',
                geoloc: {
                  coordinates: [],
                },
              },
              count: 0,
            },
          ]
        },
        SELECT_CENTER (state, center) {
          state.center.selected = center
        },
      },
      actions: {
        FETCH_MY_PROFILE_REQUEST ({ commit }) {
          commit('FETCH_MY_PROFILE_REQUEST')
        },
        FETCH_CENTERS_REQUEST ({ commit }) {
          commit('FETCH_CENTERS_REQUEST')
        },
        SELECT_CENTER ({ commit }, center) {
          commit('SELECT_CENTER', center)
        },
      },
    }),
    template: '<center-selection />',
  }))
