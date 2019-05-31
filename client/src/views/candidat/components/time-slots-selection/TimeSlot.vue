<template>
  <v-card style="position: relative;">
    <page-title class="sticky-title">
      <span class="u-truncated">
        {{ center.selected ? center.selected.nom : '' }}
      </span>
      <span class="title__small  ws-nowrap">
        ({{ center.selected ? center.selected.departement : '' }})
      </span>
    </page-title>

    <v-alert
      :value="warningMessage"
      type="warning"
      style="fontsize: 1em;"
    >
      {{ warningMessage }}
    </v-alert>

    <v-tabs
      v-model="switchTab"
      centered
      slider-color="primary"
      color="#dfdfdf"
      class="sticky-months"
    >
      <v-tab
        v-for="month in timeSlots.list"
        :key="month.month"
        :href="`#tab-${month.month}`"
        @click="$router.push({ name: 'time-slot' })"
      >
        <span v-if="month.availableTimeSlots.length" class="primary--text">{{ month.month }}</span>
        <span v-else class="blue-grey--text">{{ month.month }}</span>
      </v-tab>
    </v-tabs>
    <v-tabs-items class="tabs-items-block" v-model="switchTab">
      <v-tab-item
        v-for="timeSlot in timeSlots.list"
        :key="timeSlot.month"
        :value="`tab-${timeSlot.month}`"
      >
        <v-card flat>
          <v-card-text>
            <times-slots-selector v-if="timeSlot.availableTimeSlots.length" :initial-time-slots="timeSlot.availableTimeSlots"/>
            <div v-else class="blue-grey--text  font-italic">Il n'y a pas de créneau disponible pour ce mois.</div>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <v-card-actions class="u-flex--center">
      <v-btn
        outline
        color="info"
        @click="goToSelectCenter"
      >
        <v-icon>
          arrow_back_ios
        </v-icon>
        Retour
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
  getFrenchLuxonDateFromIso,
  getFrenchDateFromIso,
} from '@/util/frenchDateTime.js'
import { getFrenchLuxonCurrentDateTime } from '../../../../util/frenchDateTime'

export default {
  components: {
    TimesSlotsSelector,
  },

  data () {
    return {
      timeoutid: undefined,
      statusDayBlock: false,
      switchTab: null,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'reservation']),
    ...mapState({
      dateDernierEchecPratique (state) {
        const dateDernierEchecPratique = state.reservation.booked.dateDernierEchecPratique
        return dateDernierEchecPratique && getFrenchDateFromIso(dateDernierEchecPratique)
      },
      numberOfDaysBeforeDate: state => state.reservation.booked.dayToForbidCancel,
      isEchecPratique: state => state.reservation.booked.dateDernierEchecPratique,
    }),

    warningMessage () {
      if (this.isPenaltyActive) {
        return this.$formatMessage(
          {
            id: 'home_choix_date_creneau_message_de_penalite',
          },
          {
            numberOfDaysBeforeDate: this.numberOfDaysBeforeDate,
            displayDate: this.displayDate,
          },
        )
      }
      if (this.isEchecPratique) {
        return this.$formatMessage(
          {
            id: 'home_choix_date_creneau_message_echec_date_pratique',
          },
          {
            dateDernierEchecPratique: this.dateDernierEchecPratique,
            dateEchecPratique: this.dateEchecPratique,
          },
        )
      }
      return ''
    },

    isPenaltyActive () {
      if (this.isEchecPratique) {
        return false
      }
      const { canBookFrom, lastDateToCancel } = this.reservation.booked
      const isPenaltyActive = canBookFrom ||
        getFrenchLuxonCurrentDateTime() > getFrenchLuxonDateFromIso(lastDateToCancel)

      return isPenaltyActive
    },

    displayDate () {
      const { canBookFrom, date, lastDateToCancel, timeOutToRetry } = this.reservation.booked
      if (canBookFrom) {
        return getFrenchDateFromIso(canBookFrom)
      } else if (getFrenchLuxonCurrentDateTime() > getFrenchLuxonDateFromIso(lastDateToCancel)) {
        return getFrenchDateFromLuxon(getFrenchLuxonDateFromIso(date).plus({ days: timeOutToRetry }))
      }
      return ''
    },

    dateEchecPratique () {
      const { canBookFrom, date, timeOutToRetry } = this.reservation.booked
      if (canBookFrom) {
        return getFrenchDateFromIso(canBookFrom)
      } else if (getFrenchLuxonCurrentDateTime() > getFrenchLuxonDateFromIso(this.dateDernierEchecPratique)) {
        return getFrenchDateFromLuxon(getFrenchLuxonDateFromIso(date).plus({ days: timeOutToRetry }))
      }
      return ''
    },
  },

  methods: {
    activeDayBlock () {
      this.statusDayBlock = !this.statusDayBlock
    },

    async getTimeSlots () {
      const selected = this.center.selected
      if (!selected || !selected._id) {
        if (!this.center.isFetchingCenter) {
          const { center: nom, departement } = this.$route.params
          await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
        }
        this.timeoutid = setTimeout(this.getTimeSlots, 100)
        return
      }
      await this.$store.dispatch(FETCH_DATES_REQUEST, selected._id)
      this.timeoutid = setTimeout(this.getTimeSlots, 30000)
    },

    goToSelectCenter () {
      this.$router.push({
        name: 'selection-centre',
      })
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
    await this.getTimeSlots()
  },

  async destroyed () {
    clearTimeout(this.timeoutid)
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
  top: 150px;
  z-index: 1;
}
</style>
