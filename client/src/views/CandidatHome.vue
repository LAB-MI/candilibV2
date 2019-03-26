<template>
  <div style="max-width: 100vw;">
    <selection-summary v-if="reservation.booked" />
    <center-selection v-else/>
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
  components: {
    SelectionSummary,
    CenterSelection,
  },

  name: 'candidat-home',

  computed: {
    ...mapState(['candidat', 'reservation']),
  },
  data () {
    return {
      candidatStatus: true,
    }
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

  async mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
    await this.getCandidatReservation()
  },
}
</script>
