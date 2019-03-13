<template>
  <v-card>
    <section>
      <header class="candidat-section-header">
        <h2 class="candidat-section-header__title">
          Ma réservation
        </h2>
      </header>
    </section>
    <div v-if="!candidat.reservation.length">
      <router-link :to="{name: 'selection-centre'}">
        <v-btn>Sélectionner un centre</v-btn>
      </router-link>
    </div>
    <div v-if="candidat.reservation.length">
      <reservation-view/>
    </div>
  </v-card>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import {
  FETCH_CANDIDAT_RESERVATION_REQUEST,
} from '@/store'

import ReservationView from './candidat/components/reservation-view/ReservationView.vue'

export default {
    components: {
    ReservationView,
  },

  name: 'candidat-home',

  computed: {
      ...mapState(['candidat']),
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
        await this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },

  mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
    this.getCandidatReservation()
  },
}
</script>
