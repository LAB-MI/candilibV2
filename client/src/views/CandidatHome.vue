<template>
  <v-card>
    <div v-if="!candidat.reservation">
      <!-- <router-link :to="{name: 'selection-centre'}">
        <v-btn>Sélectionner un centre</v-btn>
      </router-link> -->
      <center-selection/>
    </div>
    <div v-if="candidat.reservation">
      <section>
        <header class="candidat-section-header">
          <h2 class="candidat-section-header__title">
            Ma réservation
          </h2>
        </header>
      </section>
      <reservation-view :reservation="candidat.reservation" :candidat="candidat.me" />
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
import CenterSelection from './candidat/components/center-selection/CenterSelection.vue'

export default {
    components: {
    ReservationView,
    CenterSelection,
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

  async mounted () {
    this.$router.replace({ name: 'candidat-presignup' })
    try {
      await this.getCandidatReservation()
    } catch (error) {
      this.$store.dispatch(SHOW_ERROR, error.message)
    }
  },
}
</script>
