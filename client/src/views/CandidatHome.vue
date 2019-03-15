<template>
  <v-card>
    <div v-if="reservation.list">
      <section>
        <header class="candidat-section-header">
          <h2 class="candidat-section-header__title">
            Ma réservation
          </h2>
        </header>
      </section>
      <confirm-selection :flagRecap="true"/>
    </div>
    <div v-else>
      <center-selection/>
    </div>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
} from '@/store'

// import ReservationRecap from './candidat/components/reservation-recap/ReservationView.vue'
import ConfirmSelection from './candidat/components/confirm-selection/ConfirmSelection.vue'
import CenterSelection from './candidat/components/center-selection/CenterSelection.vue'

export default {
  components: {
    // ReservationRecap,
    ConfirmSelection,
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
        // this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },

  async mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
    try {
      await this.getCandidatReservation()
    } catch (error) {
      // this.$store.dispatch(SHOW_ERROR, error.message)
    }
  },
}
</script>
