<template>
  <v-card style="position: relative;">
    <page-title
      v-if="center.selected"
      class="sticky-title"
    >
      <span class="u-truncated">{{ center.selected.nom }}</span>
      <span
        class="title__small ws-nowrap"
      >
        ({{ center.selected.geoDepartement }})
      </span>
    </page-title>
    <message-info-places />

    <v-alert
      class="t-warning-message"
      :value="!!warningMessage"
      type="warning"
      style="font-size: 1em;"
    >
      {{ warningMessage }}
    </v-alert>
    <div style="position: relative;">
      <big-loading-indicator :is-loading="timeSlots.isFetching" />
      <v-tabs
        v-model="switchTab"
        centered
        slider-color="primary"
        color="#dfdfdf"
        class="sticky-months"
      >
        <v-tab
          v-for="month in timeSlots.list"
          :key="month.label"
          :href="`#tab-${month.label}`"
          @click="$router.push({ name: 'time-slot', params: { month: month.label, day: $route.params.day } })"
        >
          <span
            v-if="month.days"
            class="primary--text"
          >{{ month.label }}</span>
          <span
            v-else
            class="blue-grey--text"
          >{{ month.label }}</span>
        </v-tab>
      </v-tabs>
      <v-tabs-items
        v-model="switchTab"
        class="tabs-items-block"
      >
        <v-tab-item
          v-for="month in timeSlots.list"
          :key="month.label"
          :value="`tab-${month.label}`"
          :class="`t-tab-${month.label}`"
        >
          <v-card flat>
            <v-card-text>
              <times-slots-selector
                v-if="month.days"
                :initial-time-slots="Array.from(month.days).map(e => e[1])"
              />
              <div
                v-else
                class="blue-grey--text font-italic t-time-slots-message-empty-places"
              >
                Il n'y a pas de créneau disponible pour ce mois.
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <v-card-actions class="u-flex--center">
      <v-btn
        outlined
        color="info"
        @click="goToSelectCenter"
      >
        <v-icon>arrow_back_ios</v-icon>Retour
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import TimesSlotsSelector from './TimesSlotsSelector'
import {
  FETCH_CENTER_REQUEST,
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_DATES_REQUEST,
} from '@/store'

import {
  getFrenchDateFromLuxon,
  getFrenchLuxonFromIso,
  getFrenchDateFromIso,
  getFrenchLuxonCurrentDateTime,
} from '@/util/frenchDateTime.js'
import MessageInfoPlaces from '../MessageInfoPlaces'
import { BigLoadingIndicator } from '@/components'

export default {
  components: {
    BigLoadingIndicator,
    MessageInfoPlaces,
    TimesSlotsSelector,
  },

  data () {
    return {
      timeoutId: undefined,
      statusDayBlock: false,
      switchTab: null,
    }
  },

  computed: {
    ...mapState({
      center: state => state.center,
      timeSlots: state => state.timeSlots,
      reservation: state => state.reservation,
      dateDernierEchecPratique (state) {
        const dateDernierEchecPratique = state.reservation.booked.dateDernierEchecPratique
        return dateDernierEchecPratique
      },
      numberOfDaysBeforeDate: state => state.reservation.booked.dayToForbidCancel,
      timeOutToRetry: state => state.reservation.booked.timeOutToRetry,
    }),
    canCancelBooking () {
      return this.$store.getters.canCancelBooking
    },
    isEchecPratique () {
      const { canBookFrom, dateDernierEchecPratique } = this.reservation.booked
      const dateLastEchecPlus45Days = dateDernierEchecPratique &&
        getFrenchLuxonFromIso(dateDernierEchecPratique).plus({ days: this.timeOutToRetry || 45 }).endOf('day')

      if (canBookFrom && dateLastEchecPlus45Days && (getFrenchLuxonFromIso(canBookFrom) > dateLastEchecPlus45Days)) {
        return false
      }

      const now = getFrenchLuxonCurrentDateTime()
      return this.dateDernierEchecPratique && dateLastEchecPlus45Days > now
    },

    warningMessage () {
      if (this.isPenaltyActive) {
        return this.$formatMessage(
          {
            id: 'home_choix_date_creneau_message_de_penalite',
          },
          {
            numberOfDaysBeforeDate: this.numberOfDaysBeforeDate,
            canBookFromAfterCancel: this.canBookFromAfterCancel,
          },
        )
      }
      if (this.isEchecPratique) {
        return this.$formatMessage(
          {
            id: 'home_choix_date_creneau_message_echec_date_pratique',
          },
          {
            dateDernierEchecPratique: getFrenchDateFromIso(this.dateDernierEchecPratique),
            canBookFromAfterFailure: this.canBookFromAfterFailure,
          },
        )
      }
      return ''
    },

    isPenaltyActive () {
      if (this.isEchecPratique) {
        return false
      }
      const now = getFrenchLuxonCurrentDateTime()
      const { canBookFrom } = this.reservation.booked
      const isPenaltyActive =
        (canBookFrom && getFrenchLuxonFromIso(canBookFrom) > now) || !this.canCancelBooking

      return isPenaltyActive
    },

    canBookFromAfterCancel () {
      const {
        canBookFrom,
        date,
        timeOutToRetry,
      } = this.reservation.booked

      if (canBookFrom) {
        return getFrenchDateFromIso(canBookFrom)
      } else if (!this.canCancelBooking) {
        return getFrenchDateFromLuxon(
          getFrenchLuxonFromIso(date).plus({ days: timeOutToRetry }),
        )
      }
      return ''
    },

    canBookFromAfterFailure () {
      const { canBookFrom } = this.reservation.booked
      if (canBookFrom) {
        return getFrenchDateFromIso(canBookFrom)
      }
      return ''
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
    await this.getTimeSlots()
    this.switchTab = this.$route.params.month ? `tab-${this.$route.params.month}` : `tab-${this.timeSlots.list[0].month}`
    if (this.timeSlots.list.length && !this.$route.params.month) {
      this.$router.push({ name: 'time-slot', params: { month: this.timeSlots.list[0].month, day: this.$route.params.day } })
    }
  },

  beforeDestroy () {
    clearTimeout(this.timeoutId)
    this.timeoutId = null
  },

  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },

    async getTimeSlots () {
      const {
        center: nom,
        departement,
      } = this.$route.params
      const selected = this.center.selected
      if (!selected) {
        if (!this.center.isFetchingCenter) {
          await this.$store.dispatch(FETCH_CENTER_REQUEST, {
            nom,
            departement,
          })
        }
        this.timeoutId = setTimeout(this.getTimeSlots, 100)
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, { geoDepartement: selected.geoDepartement, nomCentre: selected.nom })
      if (this.timeoutId !== null) {
        this.timeoutId = setTimeout(this.getTimeSlots, 10000)
      }
    },

    goToSelectCenter () {
      this.$router.push({
        name: 'selection-centre',
        params: {
          departement: `${this.$route.params.departement || this.$store.state.departements.selectedDepartement.departement}`,
        },
      })
    },
  },
}
</script>

<style>
.title__small {
  font-size: 0.7em;
  margin-left: 0.2em;
}

.ws-nowrap {
  white-space: nowrap;
}

.tabs-items-block > .v-window__container {
  height: auto !important; /* TODO: Find a better way */
}

.sticky-title {
  position: sticky;
  top: 36px;
  z-index: 1;
}

.sticky-months {
  position: sticky;
  top: 180px;
  z-index: 1;
}
</style>
