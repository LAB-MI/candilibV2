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
        reservation: {
          booked: {},
        },
      },
      mutations: {
        FETCH_CANDIDAT_RESERVATION_REQUEST (state) {
          state.reservation.booked = {
            _id: '5ca387399949a7001e5edfd4',
            centre: {
              __v: 0,
              _id: '5c87b264b62cc5004cc77894',
              adresse: '99 Avenue du Général de Gaulle, Rosny ss Bois, FR, 93110',
              departement: '93',
              label: "Centre d'examen du permis de conduire de Rosny-sous-Bois",
              nom: 'Rosny',
            },
            date: '2019-04-11T10:30:00.000Z',
            dayToForbidCancel: 7,
            isBooked: true,
            lastDateToCancel: '2019-04-04',
            timeOutToRetry: 45,
          }
        },
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
                  day: 'mardi 21 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 22 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 23 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 24 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 25 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 26 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 27 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 28 juin 2019',
                  hours: [
                    '13h30-14h00',
                    '14h00-14h30',
                  ],
                },
                {
                  day: 'mardi 29 juin 2019',
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
        FETCH_CANDIDAT_RESERVATION_REQUEST ({ commit }) {
          commit('FETCH_CANDIDAT_RESERVATION_REQUEST')
        },
      },
      methods: {
        isPenaltyActive () {
          return true
        },
        numberOfDaysBeforeDate () {
          return this.state.reservation.booked.dayToForbidCancel
        },
        displayDate () {
          return 'dimanche 26 mai 2019'
        },
      },
    }),
    template: '<time-slot />',
  }))
