<template>
  <div style="max-width: 100vw;">
    <big-loading-indicator :is-loading="isFetching" />

    <selection-summary v-if="!isFetching && reservation.booked.isBooked" />
    <departement-selection v-else-if="!isFetching" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  SHOW_ERROR,
} from '@/store'

import SelectionSummary from './candidat/components/selection-summary/SelectionSummary.vue'
import DepartementSelection from './candidat/components/departement-selection/DepartementSelection.vue'

export default {

  name: 'CandidatHome',
  components: {
    SelectionSummary,
    DepartementSelection,
    BigLoadingIndicator,

  },

  data () {
    return {
      candidatStatus: true,
      isFetching: true,
    }
  },

  computed: {
    ...mapState(['candidat', 'reservation']),
  },

  async beforeMount () {
    await this.getCandidatReservation()
    this.isFetching = false
  },

  methods: {
    async getCandidatReservation () {
      try {
        await this.$store.dispatch(FETCH_CANDIDAT_RESERVATION_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>
