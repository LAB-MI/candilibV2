import Vuex from 'vuex'

import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'

import router from '@/router'
import TimesSlotsSelector from './TimesSlotsSelector.vue'

storiesOf('Candidat', module)
  .add('TimesSlotsSelector', () => ({
    components: { TimesSlotsSelector },
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
    template: '<times-slots-selector :initial-time-slots="availableTimeSlots" />',
    methods: {
      selectSlot (slot) {
        action('slot')(slot)
      },
      checkDayToDisplay () {
        action('checkDayToDisplay')
      },
      gotoDay () {
        action('gotoDay')
      },
    },
    data () {
      return {
        availableTimeSlots: [{
          day: 'lundi 4 mars',
          hours: ['9H30-10H00'],
        }],
      }
    },
  }))
