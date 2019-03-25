import Vuex from 'vuex'
import { storiesOf } from '@storybook/vue'

import router from '@/router'
import TimeSlot from './TimeSlot.vue'

storiesOf('Candidat', module)
  .add('TimeSlot', () => ({
    components: { TimeSlot },
    router,
    store: new Vuex.Store({
      state: {
        center: {
          selected: {
            __v: 0,
            _id: '5c87b264b62cc5004cc77894',
            adresse: '99 Avenue du Général de Gaulle, Rosny ss Bois, FR, 93110',
            departement: '93',
            label: "Centre d'examen du permis de conduire de Rosny-sous-Bois",
            nom: 'Rosny',
          },
        },
        timeSlots: {
          list: [],
        },
      },
      mutations: {
        FETCH_DATES_REQUEST (state) {
          state.timeSlots.list = [
            {
              month: 'mars',
              availableTimeSlots: [
                {
                  day: 'mardi 26 mars 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
              ],
            },
            {
              month: 'avril',
              availableTimeSlots: [],
            },
            {
              month: 'mai',
              availableTimeSlots: [
                {
                  day: 'mardi 26 mai 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
              ],
            },
            {
              month: 'juin',
              availableTimeSlots: [
                {
                  day: 'mardi 26 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
              ],
            },
          ]
        },
      },
      actions: {
        FETCH_DATES_REQUEST ({ commit }) {
          commit('FETCH_DATES_REQUEST')
        },
      },
    }),
    template: '<time-slot />',
  }))
