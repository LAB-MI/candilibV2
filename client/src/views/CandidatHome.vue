<template>
  <div style="max-width: 100vw;">
    <selection-summary v-if="reservation.booked.isBooked" />
    <center-selection v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
  SHOW_ERROR,
} from '@/store'

import SelectionSummary from './candidat/components/selection-summary/SelectionSummary.vue'
import CenterSelection from './candidat/components/center-selection/CenterSelection.vue'

export default {

  name: 'CandidatHome',
  components: {
    SelectionSummary,
    CenterSelection,
  },

  data () {
    return {
      candidatStatus: true,
    }
  },

  computed: {
    ...mapState(['candidat', 'reservation']),
  },

  async mounted () {
    this.$router.replace({ name: 'landing-page' })
    await this.getCandidatReservation()
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
