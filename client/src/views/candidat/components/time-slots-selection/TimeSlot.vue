<template>
  <v-card style="position: relative">
    <page-title class="sticky-60">
      {{ center.selected ? center.selected.nom : '' }}
      <span class="title__small">
        ({{ center.selected ? center.selected.departement : '' }})
      </span>
    </page-title>
    <v-alert
      v-if="isPenaltyActive"
      :value="true"
      type="warning"
      style="fontSize: 1em;"
    >
      {{ $formatMessage(
          {
            id: 'home_choix_date_crenaux_message_de_penalite',
          },
          {
            numberOfDaysBeforeDate,
            displayDate,
          },
        )
      }}
    </v-alert>
    <v-tabs
      v-model="switchTab"
      centered
      slider-color="primary"
      color="#dfdfdf"
      class="sticky-80"
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
            <div v-else class="blue-grey--text  font-italic">Il n'y a plus de crénaux disponible pour ce mois</div>
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
import { DateTime } from 'luxon'

import TimesSlotsSelector from './TimesSlotsSelector'
import {
  FETCH_CENTER_REQUEST,
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  FETCH_DATES_REQUEST,
} from '@/store'

import {
  dateTimeFromIsoSetLocaleFr,
  dateTimeFromIsoSetLocaleFrToLocalString,
} from '../../../../util/dateTimeWithSetLocale.js'

import PageTitle from '@/components/PageTitle'

export default {
  components: {
    TimesSlotsSelector,
    PageTitle,
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

    numberOfDaysBeforeDate () {
      if (this.reservation.booked.dayToForbidCancel) {
        return this.reservation.booked.dayToForbidCancel
      }
      return false
    },

    isPenaltyActive () {
      const { canBookAfter, lastDateToCancel } = this.reservation.booked
      if (canBookAfter ||
        DateTime.local().setLocale('fr') > dateTimeFromIsoSetLocaleFr(lastDateToCancel)) {
        return true
      }
      return false
    },

    displayDate () {
      const { canBookAfter } = this.reservation.booked
      if (canBookAfter) {
        return dateTimeFromIsoSetLocaleFrToLocalString(canBookAfter)
      }
      return false
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
      this.timeoutid = setTimeout(this.getTimeSlots, 5000)
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
}
.sticky-60 {
  position: sticky;
  top: 56px;
  z-index: 1;
}
.sticky-80 {
  position: sticky;
  top: 130px;
  z-index: 1;
}
</style>
